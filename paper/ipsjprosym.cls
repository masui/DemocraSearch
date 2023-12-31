% ipsjprosym.cls  (C) 2014 Prosym Kanjikai
% Copyright (C) 2014 by Kiminori Matsuzaki

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{ipsjprosym}
[2014/09/07 v1.00 IPSJ class]

%%%%%% Document Styles %%%%%%
\newif\ifDSP@withpage \DSP@withpagefalse
\newif\ifDSP@english \DSP@englishfalse

\DeclareOption{withpage}{\DSP@withpagetrue}
\DeclareOption{english}{\DSP@englishtrue}
\ProcessOptions

%%
%% Option
%%
\LoadClass[submit,techreq,noauthor%
\ifDSP@english ,english\fi%
]{ipsj}

%% $BDs=PMQ$K$O%X%C%@%U%C%?$r$D$1$J$$!%(B
\ifDSP@withpage
\let\ps@IPSJTITLEheadings\ps@plain
\pagestyle{plain}
\else
\let\ps@IPSJTITLEheadings\ps@empty
\pagestyle{empty}
\fi

%% $B2F$N%W%m%0%i%`!&%7%s%]%8%&%`(B $B<A5?!&1~Ez(B $B$N$?$a(B
\newenvironment{QandA}%
{\subsection*{{\normalsize $B<A5?!&1~Ez(B}}\begin{description}\def\makelabel##1{##1}}
{\end{description}}

%% $BHGLL$N$_(B A4 -> B5 $B%5%$%:$X=L>.$9$k(B
\addtolength{\textwidth}{-24mm} % 210mm-182mm=28mm$B$@$,(B
\addtolength{\oddsidemargin}{12mm}
\addtolength{\evensidemargin}{12mm}

\addtolength{\textheight}{-36mm} % 297mm-257mm=40mm$B$@$,(B
\addtolength{\topmargin}{18mm}

\endinput

