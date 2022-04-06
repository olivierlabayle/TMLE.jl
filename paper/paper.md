---
title: 'TMLE: A Julia package for Targeted-Learning'
tags:
  - Julia
  - Causal Inference
  - Statistical Learning
  - Targeted Learning
authors:
  - name: Sjoerd Viktor Beentjes^[Co-first author] # note this makes a footnote saying 'Co-first author'
    orcid: 0000-0002-7998-4262
    affiliation: "1, 2" # (Multiple affiliations must be quoted)
  - name: Ava Khamseh^[Co-first author]
    orcid: 0000-0001-5203-2205
    affiliation: "1, 3"
  - name: Olivier Labayle^[Corresponding author]
    orcid: 0000-0002-3708-3706
    affiliation: "1, 3"
affiliations:
 - name: MRC Human Genetics Unit, Institute of Genetics \& Cancer, Universit of Edinburgh, Edinburgh EH4 2XU, United Kingdom.
   index: 1
 - name: School of Mathematics, University of Edinburgh, Edinburgh EH9 3FD, United Kingdom.
   index: 2
 - name: School of Informatics, University of Edinburgh, Edinburgh EH8 9AB, United Kingdom
   index: 3
date: 6 April 2022
bibliography: paper.bib

---

# Summary

Most scientific fields are now facing a deluge of big datasets that represent opportunities ready to be seized
to advance research. Machine-Learning tool-boxes, such as [@MLJ] provide researchers with a user friendly suite of 
statistical procedures that they can effortlessly use to answer their questions of interest. However, the following 
two realizations unveil the challenges ahead. First, scientific research is driven by causal questions, not statistical
ones. Machine-Learning methods infer high dimensional probabilistic functions while scientific questions are
better represented by finite dimensional quantities like: "what is the effect of modyfying this variable on my system?". 
Second, statistical confidence grows with the sample size, yet, very few methods come with mathematical 
guarantees to backup their estimates. Targeted-Learning is a general statistical framework for unbiased and efficient 
estimation which was developed by Mark van der Laan [@ref1]. It is particularly well suited for the estimation
of causal effects and is gaining popularity in many fields such as biostatistics, epidemiology, econometrics... Unfortunately,
the underlying theory is somewhat abstract and discouraging for the uninformed researcher. Existing packages like [tmle3] or [] have not been
developped with flexibility and scalability in mind

TMLE is a Julia package that aims at addressing those issues and to bring Targeted-Learning to a broad audience. To that end, it is built on top of [@MLJ], 
a popular package for machine-learning in the Julia language. More precisely, we provide a `TMLEEstimator` structure which exposes the 
same interface as any other MLJ model. We also provide a rich set of features

# Statement of need

`Gala` is an Astropy-affiliated Python package for galactic dynamics. Python
enables wrapping low-level languages (e.g., C) for speed without losing
flexibility or ease-of-use in the user-interface. The API for `Gala` was
designed to provide a class-based and user-friendly interface to fast (C or
Cython-optimized) implementations of common operations such as gravitational
potential and force evaluation, orbit integration, dynamical transformations,
and chaos indicators for nonlinear dynamics. `Gala` also relies heavily on and
interfaces well with the implementations of physical units and astronomical
coordinate systems in the `Astropy` package [@astropy] (`astropy.units` and
`astropy.coordinates`).

`Gala` was designed to be used by both astronomical researchers and by
students in courses on gravitational dynamics or astronomy. It has already been
used in a number of scientific publications [@Pearson:2017] and has also been
used in graduate courses on Galactic dynamics to, e.g., provide interactive
visualizations of textbook material [@Binney:2008]. The combination of speed,
design, and support for Astropy functionality in `Gala` will enable exciting
scientific explorations of forthcoming data releases from the *Gaia* mission
[@gaia] by students and experts alike.

# Mathematics

Single dollars ($) are required for inline mathematics e.g. $f(x) = e^{\pi/x}$

Double dollars make self-standing equations:

$$\Theta(x) = \left\{\begin{array}{l}
0\textrm{ if } x < 0\cr
1\textrm{ else}
\end{array}\right.$$

You can also use plain \LaTeX for equations
\begin{equation}\label{eq:fourier}
\hat f(\omega) = \int_{-\infty}^{\infty} f(x) e^{i\omega x} dx
\end{equation}
and refer to \autoref{eq:fourier} from text.

# Citations

Citations to entries in paper.bib should be in
[rMarkdown](http://rmarkdown.rstudio.com/authoring_bibliographies_and_citations.html)
format.

If you want to cite a software repository URL (e.g. something on GitHub without a preferred
citation) then you can do it with the example BibTeX entry below for @fidgit.

For a quick reference, the following citation commands can be used:
- `@author:2001`  ->  "Author et al. (2001)"
- `[@author:2001]` -> "(Author et al., 2001)"
- `[@author1:2001; @author2:2001]` -> "(Author1 et al., 2001; Author2 et al., 2002)"

# Figures

Figures can be included like this:
![Caption for example figure.\label{fig:example}](figure.png)
and referenced from text using \autoref{fig:example}.

Figure sizes can be customized by adding an optional second parameter:
![Caption for example figure.](figure.png){ width=20% }

# Acknowledgements

We acknowledge contributions from Brigitta Sipocz, Syrtis Major, and Semyeong
Oh, and support from Kathryn Johnston during the genesis of this project.

# References