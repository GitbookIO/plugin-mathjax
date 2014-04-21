$(document).bind("bookReady", function() {
    MathJax.Hub.Config({
        tex2jax: {
          inlineMath: [['$','$'], ['\\(','\\)']],
          processEscapes: true
        }
    });


    gitbook.bind("page.change", function() {
        MathJax.Hub.Typeset()
    });
});