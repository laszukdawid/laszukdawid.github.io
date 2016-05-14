---
layout: post
title:  "Big welcome"
date:   2016-05-14 20:15:33 +0100
---
<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

Greetings people!

Sole purpose of this note: show-off [Jekyll]'s power.

Normally I'd do this in form of interpretive dance, but let's try to show via some maths.
With some magic of Python let's plot a function *f(x)* which is
$$ f(x) = x^2 \sin(2x), $$
where $$x$$ is obviously the argument.

And now some Python code:
{% highlight python %}
import numpy as np
import pylab as py

def f(x):
    return x**2 * np.sin(2*np.pi* x)

x = np.arange(0, 1, 0.01)
py.plot(x, f(x))
py.show()
{% endhighlight %}

And now some produced plot:
![Graph of function](/extras/testPlot.png)

[Jekyll]: https://jekyllrb.com/
