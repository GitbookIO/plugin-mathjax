const GitBook = require('gitbook-core');
const { React } = GitBook;

const MathJaxSVG = React.createClass({
    propTypes: {
        inline:   React.PropTypes.bool.isRequired,
        filename: React.PropTypes.string.isRequired
    },

    render() {
        const { inline, filename } = this.props;

        const img = <img src={`/${filename}`} />;

        if (inline) {
            return img;
        }
        else {
            return (
                <div className="MathJaxBlock-MathJaxSVG">
                    {img}
                </div>
            );
        }
    }
});

const MathJaxBlock = React.createClass({
    propTypes: {
        isSVG:    React.PropTypes.bool.isRequired,
        inline:   React.PropTypes.bool,
        content:  React.PropTypes.string,
        filename: React.PropTypes.string
    },

    render() {
        const { isSVG, inline, content, filename } = this.props;

        return (
            <span className="MathJaxBlock">
                <GitBook.ImportCSS href="gitbook/mathjax/mathjax.css" />
            { isSVG ?
                null
                :
                <GitBook.ImportScript src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" />
            }
            { isSVG ?
                <MathJaxSVG filename={filename} inline={inline} />
                :
                <span>
                    <script type={`math/tex; ${inline ? '' : 'mode=display'}`}>{content}</script>
                </span>
            }
            </span>
        );
    }
});

module.exports = GitBook.createPlugin({
    activate: (dispatch, getState, { Components }) => {
        dispatch(Components.registerComponent(MathJaxBlock, { role: 'block:math' }));
    }
});
