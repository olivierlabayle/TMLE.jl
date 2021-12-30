mutable struct TMLEstimator <: MLJ.DeterministicComposite 
    Q̅::MLJ.Supervised
    G::MLJ.Supervised
    F::Union{LinearRegressor, LinearBinaryClassifier}
    R::Report
    queries
    threshold::Float64
end

"""
    TMLEstimator(Q̅, G, F, query; threshold=0.005)

Implements the Targeted Minimum Loss-Based Estimator introduced by
van der Laan in https://pubmed.ncbi.nlm.nih.gov/22611591/. Two functionals of the 
data generating distribution can currently be estimated:

- The classic Average Treatment Effect (ATE)
- The Interaction Average Treatment Effect (IATE) defined by Beentjes and Khamseh in
https://link.aps.org/doi/10.1103/PhysRevE.102.053314. For instance, The IATE is defined for two treatment variables as: 

IATE = E[E[Y|T₁=1, T₂=1, W=w] - E[E[Y|T₁=1, T₂=0, W=w]
        - E[E[Y|T₁=0, T₂=1, W=w] + E[E[Y|T₁=0, T₂=0, W=w]

where:

- Y is the target variable (Binary)
- T = T₁, T₂ are the treatment variables (Binary)
- W are confounder variables

The TMLEstimator procedure relies on plugin estimation. Like the ATE, the IATE 
requires an estimator of t,w → E[Y|T=t, W=w], an estimator of  w → p(T|w) 
and an estimator of w → p(w). The empirical distribution will be used for w → p(w) all along. 
The estimator of t,w → E[Y|T=t, W=w] is then fluctuated to solve the efficient influence
curve equation. 

# Arguments:

- Q̅: A Supervised learner for E[Y|W, T]
- G: A Supervised learner for p(T | W)
- queries...: At least one query
- threshold: p(T | W) is truncated to this value to avoid division overflows.
"""
function TMLEstimator(Q̅, G, queries...; threshold=0.005)
    if Q̅ isa Probabilistic
        F = LinearBinaryClassifier(fit_intercept=false, offsetcol = :offset)
    elseif Q̅ isa Deterministic
        F = LinearRegressor(fit_intercept=false, offsetcol = :offset)
    end
    TMLEstimator(Q̅, G, F, Report(), queries, threshold)
end


"""
    briefreport(m::Machine{TMLEstimator}; tail=:both)

Returns the reported results.
"""
function briefreport(m::Machine{TMLEstimator}; tail=:both)
    queryreport(fitted_params(m).R, tail=tail)
end


###############################################################################
## Fit
###############################################################################

"""
    MLJ.fit(tmle::TMLEstimator, 
                 verbosity::Int, 
                 T,
                 W, 
                 y::Union{CategoricalVector{Bool}, Vector{<:Real}}

As per all MLJ inputs, T and W should respect the Tables.jl interface.
"""
function MLJ.fit(tmle::TMLEstimator, 
                 verbosity::Int, 
                 T,
                 W, 
                 y::Union{CategoricalVector{Bool}, Vector{<:Real}})
    Ts = source(T)
    Ws = source(W)
    ys = source(y)

    # Converting all tables to NamedTuples
    T = node(t->NamedTuple{keys(tmle.queries[1])}(Tables.columntable(t)), Ts)
    W = node(w->Tables.columntable(w), Ws)
    # intersect(keys(T), keys(W)) == [] || throw("T and W should have different column names")

    # Initial estimate of E[Y|T, W]:
    #   - The treatment variables are hot-encoded  
    #   - W and T are merged
    Hmach = machine(OneHotEncoder(drop_last=true), T)
    Thot = transform(Hmach, T)

    X = node((t, w) -> merge(t, w), Thot, W)
    Q̅mach = machine(tmle.Q̅, X, ys)

    # Initial estimate of P(T|W)
    #   - T is converted to an Array
    #   - The machine is implicitely fit
    Gmach = machine(tmle.G, W, adapt(T))

    offset = compute_offset(Q̅mach, X)
    # Loop over queries that will define
    # new covariate values
    outputs = []
    for query in tmle.queries
        indicators = indicator_fns(query)
        # Fluctuate E[Y|T, W] 
        # on the covariate and the offset 
        covariate = compute_covariate(Gmach, W, T, indicators; 
                                        verbosity=verbosity,
                                        threshold=tmle.threshold)
        Xfluct = fluctuation_input(covariate, offset)
        Fmach = machine(tmle.F, Xfluct, ys)
        observed_fluct = MLJ.predict_mean(Fmach, Xfluct)

        # Compute the counterfactual fluctuation values
        ct_fluct = counterfactual_fluctuations(Fmach,
                                            Q̅mach,
                                            Gmach,
                                            Hmach,
                                            indicators,
                                            W,
                                            T;
                                            verbosity=verbosity,
                                            threshold=tmle.threshold)

        # Fit the Report
        Rmach = machine(tmle.R, ct_fluct, observed_fluct, covariate, ys)

        # This is actually empty but required
        push!(outputs, MLJ.predict(Rmach, ct_fluct))
    end

    outputs = hcat(outputs...)

    mach = machine(Deterministic(), Ts, Ws, ys; predict=outputs)

    return!(mach, tmle, verbosity)
end

