module TestReport

using Test
using TMLE
using MLJBase
using MLJModels
using StableRNGs
using CategoricalArrays
using HypothesisTests


@testset "Test summary" begin
    query = Query((t=0,), (t=1,))
    r1 = TMLE.TMLEReport("y", query, [1, 2, 3, 4], 1, 0.8)
    s1 = summarize(r1)
    @test s1.query == query
    @test s1.pvalue ≈ 0.46 atol=1e-2
    @test s1.confint[1] ≈ -1.68 atol=1e-2
    @test s1.confint[2] ≈ 3.68 atol=1e-2
    @test s1.estimate == 1.0
    @test s1.initial_estimate == 0.8
    @test s1.stderror ≈ 1.36 atol=1e-2
    @test s1.mean_inf_curve == 2.5
end

@testset "Test Misc" begin
    rng = StableRNG(123)
    n = 100
    T = (t₁=categorical(rand(rng, ["CG", "CC"], n)),
         t₂=categorical(rand(rng, ["AT", "AA"], n)))
    W = (w₁=rand(rng, n), w₂=rand(rng, n))
    Y = (y₁=categorical(rand(rng, [true, false], n)),
        y₂=categorical(rand(rng, [true, false], n)))

    queries = [
        Query(case=(t₁="CC", t₂="AT"), control=(t₁="CG", t₂="AA"), name="Query1"),
        Query(case=(t₁="CG", t₂="AT"), control=(t₁="CC", t₂="AA"), name="Query2")
    ]
    Q̅ = ConstantClassifier()
    G = FullCategoricalJoint(ConstantClassifier())
    tmle = TMLEstimator(Q̅, G, queries...)
    
    fitresult = TMLE.fit(tmle, T, W, Y, verbosity=0)

    tmlereport = fitresult.tmlereports[1,1]
    z1 = ztest(tmlereport)
    confint(z1)
    z2 = OneSampleZTest(tmlereport.estimate, sqrt(mean(tmlereport.influence_curve.^2)), size(tmlereport.influence_curve, 1))
    confint(z2)
    # briefreport
    s = summarize(fitresult.tmlereports)
    @test s[1,1].query.name == "Query1"
    @test s[2,1].query.name == "Query1"
    @test s[1,2].query.name == "Query2"
    @test s[2,2].query.name == "Query2"

    # z-test
    ztest_results = ztest(fitresult.tmlereports)
    for (key, testres) in ztest_results
        @test testres isa OneSampleZTest
    end

    # Paired ztest
    testres = ztest(fitresult.tmlereports[1,1], fitresult.tmlereports[1,2])
    @test testres isa OneSampleZTest
end

end

true