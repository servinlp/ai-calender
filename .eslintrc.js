module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    },
    "globals": {
        "TimelineLite": true,
        "TimelineMax": true,
        "TweenLite": true,
        "TweenMax": true,
        "Back": true,
        "Bounce": true,
        "Circ": true,
        "Cubic": true,
        "Ease": true,
        "EaseLookup": true,
        "Elastic": true,
        "Expo": true,
        "Linear": true,
        "Power0": true,
        "Power1": true,
        "Power2": true,
        "Power3": true,
        "Power4": true,
        "Quad": true,
        "Quart": true,
        "Quint": true,
        "RoughEase": true,
        "Sine": true,
        "SlowMo": true,
        "SteppedEase": true,
        "Strong": true,
        "Draggable": true,
        "SplitText": true,
        "VelocityTracker": true,
        "CSSPlugin": true,
        "ThrowPropsPlugin": true,
        "BezierPlugin": true
    }
};