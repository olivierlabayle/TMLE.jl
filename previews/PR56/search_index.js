var documenterSearchIndex = {"docs":
[{"location":"","page":"Home","title":"Home","text":"CurrentModule = TMLE","category":"page"},{"location":"#TMLE","page":"Home","title":"TMLE","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The purpose of this package is to provide convenience methods for  Targeted Minimum Loss-Based Estimation (TMLE). TMLE is a framework for efficient estimation that was first proposed by Van der Laan et al in 2006. If you want to go beyond  misspecified models like linear regressions models that provide no theoretical guarantees you are in the right place. If you are new to TMLE, this review paper  gives a nice overview to the field. Because TMLE requires nuisance parameters  to be learnt by machine learning algorithms, this package is built on top of  MLJ. This means that any model  respecting the MLJ interface can be used to estimate the nuisance parameters.","category":"page"},{"location":"","page":"Home","title":"Home","text":"","category":"page"},{"location":"","page":"Home","title":"Home","text":"note: Note\nThis package is still experimental and documentation under construction","category":"page"},{"location":"#Installation","page":"Home","title":"Installation","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"julia> add TMLE","category":"page"},{"location":"#Get-in-touch","page":"Home","title":"Get in touch","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Please feel free to fill an issue if you want to report any bug or want to have additional features part of the package.  Contributing is also welcome.","category":"page"},{"location":"#Introduction-and-Scope-of-the-package","page":"Home","title":"Introduction and Scope of the package","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Efficient estimation is particularly well suited for the estimation of causal effects and thus most of the TMLE  literature has focused on parameters that have a causal interpretation under suitable assumptions. In what follows,  the following common causal graph is assumed:","category":"page"},{"location":"","page":"Home","title":"Home","text":"<img src=\"assets/causal_model.png\" alt=\"Causal Model\" style=\"width:400px;\"/>","category":"page"},{"location":"","page":"Home","title":"Home","text":"This graph encodes a factorization of the joint probability distribution:","category":"page"},{"location":"","page":"Home","title":"Home","text":"P(T W Y) = P(YT W)P(TW)P(W)","category":"page"},{"location":"","page":"Home","title":"Home","text":"Currently, two parameters of the generating distribution are available for estimation.","category":"page"},{"location":"#The-ATE","page":"Home","title":"The ATE","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The Average Treatment Effect (ATE) is the average additive effect of a treatment among a population.  It can be analytically computed as:","category":"page"},{"location":"","page":"Home","title":"Home","text":"ATE = E_WEYT=1 W - E_WEYT=0 W","category":"page"},{"location":"#The-IATE","page":"Home","title":"The IATE","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The Interaction Average Treatment Effect (IATE) is the counterpart to the ATE when there are potentially  multiple interacting treatments. It was generally defined by Beentjes and Khamseh in this paper and the formula for 2 treatments can be reduced to:","category":"page"},{"location":"","page":"Home","title":"Home","text":"IATE = E_WEYT_1=1 T_2=1 W - E_WEYT_1=1 T_2=0 W - E_WEYT_1=0 T_2=1 W + E_WEYT_1=0 T_2=0 W ","category":"page"},{"location":"#TMLE-2","page":"Home","title":"TMLE","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"As you can see, those two formula are very similar and can be leveraged for estimation. We can see that two intermediate quantities that will be required are: the conditional expectation of the target given the treatment and the confoundersQ(t w) = EYT=t W=w and the density of the confounders G(t w) = p(T=tW=w). TMLE is a two steps procedure, it first starts by estimating those two quantities that are termed nuisance parameters. They are called nuisance parameters because they are required for estimation but are not our target quantity of interest. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"At this point, any function estimator (machine learning method) can be used for each of the nuisance parameter. However, because we want to endow our estimation strategy with guarantees it has been shown that it is optimal to use stacking which is a ensemble method based on cross validation. Stacking is built into MLJ and you can find more information about it here. Stacking is not compulsory, and any model  respecting the MLJ Interface should work out of the box.","category":"page"},{"location":"","page":"Home","title":"Home","text":"In the second stage, TMLE fluctuates a nuisance parameter using a parametric sub-model in order to solve the efficient influence curve equation. A first benefit of this approach is that it is doubly robust, this means that only one nuisance parameter need to be consistently estimated for the full procedure to be consistent itself. Another advantage is that the estimator is asymptotically normal which means we can easily compute confidence intervals and p-values.","category":"page"},{"location":"#Quick-Start","page":"Home","title":"Quick Start","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Let's assume we have a dataset (T, W, y) where T is a set of 2 treatment variables confounded by W and for which we want to estimate the interaction effect on y. As discussed above we need to specify two learning algorithms for the suisance parameters:","category":"page"},{"location":"","page":"Home","title":"Home","text":"Q: A learning algorithm for Q(t w). For simplicity, a linear regression because Y is continuous but stacking is preferred.\nG: A learning algorithm for G(t w), here a logistic regression, again stacing is preferred. Note that T is a random vector, we thus need to estimate the joint density over T=(T_1T_2). For this purpose, a wrapper FullCategoricalJoint is provided. It will encode all combinations of T_1 T_2 into a single variable and use the underlying model to estimate the density.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Finally, we are asking a specific question. Let's be a bit more specific and say the interaction effect of both:","category":"page"},{"location":"","page":"Home","title":"Home","text":"replacing one G for a C in a homozygous person G at locus L_1\nreplacing another T for a A in a heterozygous person TA at locus L_2","category":"page"},{"location":"","page":"Home","title":"Home","text":"This is embodied by a query for which the Query type is provided. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"We are now ready to run the estimation as described in the following example (Requires add MLJLinearModels):","category":"page"},{"location":"","page":"Home","title":"Home","text":"using TMLE\nusing MLJ\n\n# Loading models\nLogisticClassifier = @load LogisticClassifier pkg=MLJLinearModels verbosity=0\nLinearRegressor = @load LinearRegressor pkg=MLJLinearModels verbosity = 0\n\n# Generating fake data\nn = 1000\nT = (\n    t₁=categorical(rand([\"CG\", \"GG\", \"CC\"], n)), \n    t₂=categorical(rand([\"TT\", \"TA\", \"AA\"], n))\n)\nW = MLJ.table(rand(n, 3))\ny = rand(n)\n\n# Defining the TMLE\nquery = Query(case=(t₁=\"CG\", t₂=\"TT\"), control=(t₁=\"GG\", t₂=\"TA\"), name=\"MyQuery\")\nQ = LinearRegressor()\nG = FullCategoricalJoint(LogisticClassifier())\ntmle = TMLEstimator(Q, G, query)\n\n# Fitting\nfitresult = TMLE.fit(tmle, T, W, y)\n\n# Report\nsummarize(fitresult.tmlereports)","category":"page"},{"location":"","page":"Home","title":"Home","text":"The content of the brief report is a Tuple that for each target/query pair reports a NamedTuple containing the following fields:","category":"page"},{"location":"","page":"Home","title":"Home","text":"target_name: If only one target is provided (y is a vector) it is denoted by y otherwise it corresponds to the columnname in the table Y.\nquery: The associated query\npvalue: The p-value\nconfint: A 95% confidence interval around the estimated quantity\nestimate: An estimate of the quantity of interest\ninitial_estimated: The initial estimate that we would have reached without applying the tmle step\nstderror: The estimate of the standard error\nmeaninfcurve: The empirical mean of the influence curve","category":"page"},{"location":"","page":"Home","title":"Home","text":"Side Notes:","category":"page"},{"location":"","page":"Home","title":"Home","text":"The effect treatment value appears in the first position in the query (for instance CG is first compared to GG which is the reference).\nAs per all MLJ inputs, T and W should respect the Tables.jl interface\nY can also be either a vetor or a Tables.jl respecting interface. This can be useful to limit computational complexity since p(TW) needs to be only fitted once for all targets.","category":"page"},{"location":"#Tutorials","page":"Home","title":"Tutorials","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"For those examples, we will need the following packages:","category":"page"},{"location":"","page":"Home","title":"Home","text":"using Random\nusing Distributions\nusing MLJ\nusing TMLE\n\nexpit(X) = 1 ./ (1 .+ exp.(-X))","category":"page"},{"location":"#ATE","page":"Home","title":"ATE","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Let's consider the following example for the ATE parameter:","category":"page"},{"location":"","page":"Home","title":"Home","text":"W = [W1, W2, W_3] is a set of binary confounding variables, W sim Bernoulli(05)\nT is a Binary variable, p(T=1W=w) = textexpit(05W_1 + 15W_2 - W_3)\nY is a Continuous variable, Y = T + 2W_1 + 3W_2 - 4W_3 + epsilon(0 1)","category":"page"},{"location":"","page":"Home","title":"Home","text":"For which the ATE can be computed explicitely and is equal to 1. In Julia such dataset can be generated like this:","category":"page"},{"location":"","page":"Home","title":"Home","text":"n = 10000\nrng = MersenneTwister(0)\n# Sampling\nUnif = Uniform(0, 1)\nW = float(rand(rng, Bernoulli(0.5), n, 3))\nt = rand(rng, Unif, n) .< expit(0.5W[:, 1] + 1.5W[:, 2] - W[:,3])\ny = t + 2W[:, 1] + 3W[:, 2] - 4W[:, 3] + rand(rng, Normal(0, 1), n)\n# W and T need to respect the Tables.jl interface.\nW = MLJ.table(W)\nT = (T=categorical(t),)","category":"page"},{"location":"","page":"Home","title":"Home","text":"We need to define 2 estimators for the nuisance parameters, usually this is  done using the Stack  but here because we know the generating process we can cheat a bit. We will use a Logistic Classifier for p(T|W) and a Constant Regressor for p(Y|W, T). This means one estimator is well specified and the other not.","category":"page"},{"location":"","page":"Home","title":"Home","text":"LogisticClassifier = @load LogisticClassifier pkg=MLJLinearModels verbosity=0\n\nquery = Query(case=(T=1,), control=(T=0,))\nQ = MLJ.DeterministicConstantRegressor()\nG = LogisticClassifier()\ntmle = TMLEstimator(Q, G, query)","category":"page"},{"location":"","page":"Home","title":"Home","text":"Now, all there is to do is to fit the estimator:","category":"page"},{"location":"","page":"Home","title":"Home","text":"fitresult = TMLE.fit(tmle, T, W, y)","category":"page"},{"location":"","page":"Home","title":"Home","text":"Their are various ways in which you can investigate the results:","category":"page"},{"location":"#Regular-MLJ-entrypoints:-fitted_params-and-report","page":"Home","title":"Regular MLJ entrypoints: fitted_params and report","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"machines","category":"page"},{"location":"","page":"Home","title":"Home","text":"fitresult.machines","category":"page"},{"location":"","page":"Home","title":"Home","text":"The fitted_params function is the regular MLJ entrypoint to retrieve all fitted parameters for all submachines in our TMLEstimator machine, it gives access to a NamedTuple that contains all results from the fit, including:","category":"page"},{"location":"","page":"Home","title":"Home","text":"A fitresult for Q\nA fitresult for G\nA fitresult for the fluctuation denoted F\nreport","category":"page"},{"location":"","page":"Home","title":"Home","text":"fitresult.tmlereports","category":"page"},{"location":"","page":"Home","title":"Home","text":"The full report of the fittedmachine, including an entry for each query denoted by fields `targeti_query_jwherei,jindex the targets and queries respectively. Each of this entry is aReport` entity that contains all the necessary information you might need to extract for this specific query.","category":"page"},{"location":"#TMLE.jl-Specific-entrypoints","page":"Home","title":"TMLE.jl Specific entrypoints","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"summarize(::TMLEReport)","category":"page"},{"location":"","page":"Home","title":"Home","text":"This is probably the main entry point to access your results:","category":"page"},{"location":"","page":"Home","title":"Home","text":"s = summarize(fitresult.tmlereports[1, 1])","category":"page"},{"location":"","page":"Home","title":"Home","text":"ztest(mach, target_idx, query_idx)","category":"page"},{"location":"","page":"Home","title":"Home","text":"It can be called either on the machine by providing a sequence of indices (see the multiple-queries section for an exemple for more than 1 query) or on the query report itself.","category":"page"},{"location":"","page":"Home","title":"Home","text":"ztest(fitresult.tmlereports[1, 1])","category":"page"},{"location":"","page":"Home","title":"Home","text":"It is a simple wrapper over the OneSampleZTest from the HypothesisTests.jl package and will provide a confidence interval, a p-value, etc....","category":"page"},{"location":"#Conslusion","page":"Home","title":"Conslusion","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"We can see that even if one nuisance parameter is misspecified, the double robustness of TMLE enables correct estimation of our target.","category":"page"},{"location":"#IATE","page":"Home","title":"IATE","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"In this case, the treatment variable T is a vector, for instance for two treatments T=(T1, T2) but it can accomodate for any dimensionality of T.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Let's consider the following example for which again the IATE is known:","category":"page"},{"location":"","page":"Home","title":"Home","text":"W is a binary outcome confounding variable, W sim Bernoulli(04)\nT =(T_1 T_2) are independent binary variables sampled from an expit model. p(T_1=1W=w) = textexpit(05w - 1) and, p(T_2=1W=w) = textexpit(-05w - 1)\nY is a binary variable sampled from an expit model. p(Y=1t_1 t_2 w) = textexpit(-2w + 3t_1 - 3t_2 - 1)","category":"page"},{"location":"","page":"Home","title":"Home","text":"In Julia:","category":"page"},{"location":"","page":"Home","title":"Home","text":"n = 10000\nrng = MersenneTwister(0)\np_w() = 0.4\npt1_given_w(w) = expit(0.5w .- 1)\npt2_given_w(w) = expit(-0.5w .- 1)\npy_given_t1t2w(t1, t2, w) = expit(-2w .+ 3t1 .- 3t2 .- 1)\n# Sampling\nUnif = Uniform(0, 1)\nw = rand(rng, Unif, n) .< p_w()\nt₁ = rand(rng, Unif, n) .< pt1_given_w(w)\nt₂ = rand(rng, Unif, n) .< pt2_given_w(w)\ny = rand(rng, Unif, n) .< py_given_t1t2w(t₁, t₂, w)\n# W should be a table\n# T should be a table of binary categorical variables\n# Y should be a binary categorical variable\nW = (W=convert(Array{Float64}, w),)\nT = (t₁ = categorical(t₁), t₂ = categorical(t₂))\ny = categorical(y)\n# Compute the theoretical IATE\nIATE₁ = (py_given_t1t2w(1, 1, 1) - py_given_t1t2w(1, 0, 1) - py_given_t1t2w(0, 1, 1) + py_given_t1t2w(0, 0, 1))*p_w()\nIATE₀ = (py_given_t1t2w(1, 1, 0) - py_given_t1t2w(1, 0, 0) - py_given_t1t2w(0, 1, 0) + py_given_t1t2w(0, 0, 0))*(1 - p_w())\nIATE = IATE₁ + IATE₀","category":"page"},{"location":"","page":"Home","title":"Home","text":"Again, we need to estimate the 2 nuisance parameters, this time let's use the  Stack with a few learning algorithms. The fluctuation will be a Logistic Regression, this is done by specifying a Bernoulli distribution for the  Generalized Linear Model.","category":"page"},{"location":"","page":"Home","title":"Home","text":"LogisticClassifier = @load LogisticClassifier pkg=MLJLinearModels verbosity=0\nDecisionTreeClassifier = @load DecisionTreeClassifier pkg=DecisionTree verbosity=0\nKNNClassifier = @load KNNClassifier pkg=NearestNeighborModels verbosity=0\n\nstack = Stack(;metalearner=LogisticClassifier(),\n                resampling=CV(),\n                lr=LogisticClassifier(),\n                tree_2=DecisionTreeClassifier(max_depth=2),\n                tree_3=DecisionTreeClassifier(max_depth=3),\n                knn=KNNClassifier())\n\nquery = Query(case=(t₁=1, t₂=1), control=(t₁=0, t₂=0))\nQ̅ = stack\nG = FullCategoricalJoint(stack)\ntmle = TMLEstimator(Q̅, G, query)","category":"page"},{"location":"","page":"Home","title":"Home","text":"And fit it!","category":"page"},{"location":"","page":"Home","title":"Home","text":"fitresult = TMLE.fit(tmle, T, W, y)\n\nsummarize(fitresult.tmlereports[1,1])","category":"page"},{"location":"#Multiple-targets/queries","page":"Home","title":"Multiple targets/queries","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"We have seen that we need to estimate nuisance parameters as efficiently as possible and this is usually where the performance bottleneck lies because we are using stacking and many learning algorithms. In some situations listed below, it is useful not to repeat the estimation of nuisance parameters:","category":"page"},{"location":"","page":"Home","title":"Home","text":"If multiple targets are considered, p(TW) needs only be fitted once\nIf multiple queries are asked, only the fluctuation step needs to be performed\nA combination of both previous scenarios is possible","category":"page"},{"location":"","page":"Home","title":"Home","text":"Let's take the genetic example once again but assume we are interested in 2 targets and 3 queries (many more combinations exist for this dataset)!","category":"page"},{"location":"","page":"Home","title":"Home","text":"using TMLE\nusing MLJ\n\n# Loading models\nLogisticClassifier = @load LogisticClassifier pkg=MLJLinearModels verbosity=0\nLinearRegressor = @load LinearRegressor pkg=MLJLinearModels verbosity = 0\n\n# Generating fake data\nn = 1000\nT = (\n    t₁=categorical(rand([\"CG\", \"GG\", \"CC\"], n)), \n    t₂=categorical(rand([\"TT\", \"TA\", \"AA\"], n))\n)\nW = MLJ.table(rand(n, 3))\nY = (y₁=rand(n), y₂=rand(n))\n\n# Defining the TMLE\nqueries = [\n    Query(case=(t₁=\"CG\", t₂=\"TT\"), control=(t₁=\"GG\", t₂=\"TA\"), name=\"Query1\"),\n    Query(case=(t₁=\"GG\", t₂=\"TT\"), control=(t₁=\"CG\", t₂=\"TA\"), name=\"Query2\"),\n    Query(case=(t₁=\"CG\", t₂=\"TT\"), control=(t₁=\"GG\", t₂=\"AA\"), name=\"Query3\")\n]\n\nQ = LinearRegressor()\nG = FullCategoricalJoint(LogisticClassifier())\ntmle = TMLEstimator(Q, G, queries...)\n\n# Fitting\nfitresult = TMLE.fit(tmle, T, W, Y)\n\n# Report\nsummarize(fitresult.tmlereports)","category":"page"},{"location":"","page":"Home","title":"Home","text":"The report contains a Report for each target/query pair.","category":"page"},{"location":"","page":"Home","title":"Home","text":"One can for instance perform a paired Z-Test to compare if the estimate resulting from two different queries for the first target is significantly different. Here we compare the first and third query:","category":"page"},{"location":"","page":"Home","title":"Home","text":"ztest(fitresult.tmlereports[1, 1], fitresult.tmlereports[1, 3])","category":"page"},{"location":"","page":"Home","title":"Home","text":"Or perform a simple Z-Test for a simple target/query, here y₂ and the first query:","category":"page"},{"location":"","page":"Home","title":"Home","text":"ztest(fitresult.tmlereports[2, 1])","category":"page"},{"location":"","page":"Home","title":"Home","text":"which will output a Tuple of three tests.","category":"page"},{"location":"#API","page":"Home","title":"API","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Modules = [TMLE]\nPrivate = false","category":"page"},{"location":"#TMLE.FullCategoricalJoint","page":"Home","title":"TMLE.FullCategoricalJoint","text":"FullCategoricalJoint(model)\n\nA thin wrapper around a classifier to fit a full categorical joint distribution.\n\n\n\n\n\n","category":"type"},{"location":"#TMLE.MachineReporter","page":"Home","title":"TMLE.MachineReporter","text":"MachineReporter()\n\nCallback used to report all the fitted machines used during the TMLE procedure. It is triggered on the after_fit event.\n\n\n\n\n\n","category":"type"},{"location":"#TMLE.Query","page":"Home","title":"TMLE.Query","text":"Structure holding the causal question of interest.\n\nname: Name identifying the query\ncase: The treatment combination that defines the case scenario\ncontrol: The treatment combination that defines the control scenario\n\n\n\n\n\n","category":"type"},{"location":"#TMLE.Query-Tuple{NamedTuple, NamedTuple}","page":"Home","title":"TMLE.Query","text":"Query(case::NamedTuple, control::NamedTuple; name=nothing)\n\n\n\n\n\n","category":"method"},{"location":"#TMLE.Query-Tuple{}","page":"Home","title":"TMLE.Query","text":"Query(;case=NamedTuple{}(), control=NamedTuple{}(), name=nothing)\n\n\n\n\n\n","category":"method"},{"location":"#TMLE.Reporter","page":"Home","title":"TMLE.Reporter","text":"Reporter()\n\nCallback used to report the estimation Report objects created during the TMLE procedure.\n\n\n\n\n\n","category":"type"},{"location":"#TMLE.TMLEstimator-Tuple{MLJModelInterface.Supervised, MLJModelInterface.Supervised, Vararg{Query}}","page":"Home","title":"TMLE.TMLEstimator","text":"TMLEstimator(Q̅, G, F, query; threshold=0.005)\n\nImplements the Targeted Minimum Loss-Based Estimator introduced by van der Laan in https://pubmed.ncbi.nlm.nih.gov/22611591/. Two functionals of the  data generating distribution can currently be estimated:\n\nThe classic Average Treatment Effect (ATE)\nThe Interaction Average Treatment Effect (IATE) defined by Beentjes and Khamseh in\n\nhttps://link.aps.org/doi/10.1103/PhysRevE.102.053314. For instance, The IATE is defined for two treatment variables as: \n\nIATE = E[E[Y|T₁=1, T₂=1, W=w] - E[E[Y|T₁=1, T₂=0, W=w]         - E[E[Y|T₁=0, T₂=1, W=w] + E[E[Y|T₁=0, T₂=0, W=w]\n\nwhere:\n\nY is the target variable (Binary)\nT = T₁, T₂ are the treatment variables (Binary)\nW are confounder variables\n\nThe TMLEstimator procedure relies on plugin estimation. Like the ATE, the IATE  requires an estimator of t,w → E[Y|T=t, W=w], an estimator of  w → p(T|w)  and an estimator of w → p(w). The empirical distribution will be used for w → p(w) all along.  The estimator of t,w → E[Y|T=t, W=w] is then fluctuated to solve the efficient influence curve equation. \n\nArguments:\n\nQ̅: A Supervised learner for E[Y|W, T]\nG: A Supervised learner for p(T | W)\nqueries...: At least one query\nthreshold: p(T | W) is truncated to this value to avoid division overflows.\n\n\n\n\n\n","category":"method"},{"location":"#MLJModelInterface.fit-Tuple{FullCategoricalJoint, Int64, Any, Any}","page":"Home","title":"MLJModelInterface.fit","text":"MLJBase.fit(model::FullCategoricalJoint, verbosity::Int, X, Y)\n\nX and Y should respect the Tables.jl interface.\n\n\n\n\n\n","category":"method"},{"location":"#MLJModelInterface.fit-Tuple{TMLEstimator, Any, Any, Any}","page":"Home","title":"MLJModelInterface.fit","text":"MLJBase.fit(tmle::TMLEstimator, \n             verbosity::Int, \n             T,\n             W, \n             Y)\n\nEstimates the Average Treatment Effect or the Interaction Average Treatment Effect  using the TMLE framework.\n\nArguments:\n\n- T: A table representing treatment variables. If multiple treatments are provided,\nthe interaction effect (IATE) is estimated.\n- W: A table of confounding variables.\n- Y: A vector or a table. If Y is a table, p(T|W) is fit only once and E[Y|T,W] \nis fit for each column in Y. If the number of target variables in large, it helps \nto drastically reduce the computational time.\n\n\n\n\n\n","category":"method"},{"location":"#TMLE.summarize-Tuple{TMLEReport}","page":"Home","title":"TMLE.summarize","text":"briefreport(r::Report; tail=:both, alpha=0.05)\n\nFor a given Report, provides a summary of useful statistics.\n\n# Arguments:     - r: A query report, for instance extracted via queryreport     - tail: controls weither the test is single or two sided: eg :left, :right or :both     - alpha: level of the test\n\n\n\n\n\n","category":"method"},{"location":"#TMLE.ztest-Tuple{TMLEReport}","page":"Home","title":"TMLE.ztest","text":"ztest(r::Report)\n\nIf the original data is i.i.d, the influence curve is Normally distributed and its variance can be estimated by the sample variance over all samples. We can then perform a Z-Test for a given Report object. It will test weither the measured  effect size is significantly different from 0 under those assumptions.\n\n\n\n\n\n","category":"method"},{"location":"#Index","page":"Home","title":"Index","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"","category":"page"}]
}
