// Import React properly with full paths
import React, { useState, useEffect, useRef } from "https://cdn.skypack.dev/react@17.0.1";
import ReactDOM from "https://cdn.skypack.dev/react-dom@17.0.1";

// Wait for complete DOM loading
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('vis-activation-layer');
  if (!container) return;

  // Activation Layer Visualization Component
  const ActivationLayerVisualization = () => {
    const [selectedFunction, setSelectedFunction] = useState('relu');
    const [inputValue, setInputValue] = useState(1.5);
    const svgRef = useRef(null);

    // Activation functions & details
    const activations = {
      relu: (x) => Math.max(0, x),
      sigmoid: (x) => 1 / (1 + Math.exp(-x)),
      tanh: (x) => Math.tanh(x),
      // Add more if needed, e.g., leaky_relu: (x) => Math.max(0.01 * x, x)
    };

    const functionDetails = {
        relu: { name: "ReLU", formula: "f(x) = max(0, x)", description: "Outputs input if positive, else 0. Simple & common." },
        sigmoid: { name: "Sigmoid", formula: "f(x) = 1 / (1 + e⁻ˣ)", description: "Squashes values to (0, 1). Used in binary classification outputs." },
        tanh: { name: "Tanh", formula: "f(x) = tanh(x)", description: "Squashes values to (-1, 1). Zero-centered alternative to sigmoid." }
    };

     // Colors (aligned with convolutional layer example)
     const colors = {
      plotLine: '#007bff', // Blue for the function line
      inputPoint: '#dc3545', // Red for input marker
      outputPoint: '#28a745', // Green for output marker
      axis: '#adb5bd',
      grid: '#e9ecef',
      text: '#495057',
      controlBg: '#ffffff', // White background for controls area
      controlBorder: '#dee2e6',
      highlight: '#ffeeba' // Yellowish highlight
    };

    // SVG dimensions and plot parameters
    const width = 450; // Slightly wider
    const height = 300; // Slightly taller
    const plotPadding = 40;
    const plotWidth = width - 2 * plotPadding;
    const plotHeight = height - 2 * plotPadding;
    const xMin = -5;
    const xMax = 5;
    const yMin = -1.5;
    // const yMax = 1.5;
    // set yMax based on the selected function, if relu, yMax is 5, else yMax is 1.5
    const yMax = selectedFunction === 'relu' ? 5 : 1.5;
    // Scaling functions
    const scaleX = (x) => plotPadding + ((x - xMin) / (xMax - xMin)) * plotWidth;
    const scaleY = (y) => height - plotPadding - ((y - yMin) / (yMax - yMin)) * plotHeight;

     // Generate points for the function plot, handling clipping
     const generatePlotPoints = (func) => {
        const points = [];
        const steps = 100;
        let lastY = null; // Track last y to handle clipping correctly

        for (let i = 0; i <= steps; i++) {
            const x = xMin + (i / steps) * (xMax - xMin);
            const y = func(x);
            const scaledX = scaleX(x);
            let scaledY = scaleY(y);
            let clipped = false;

            if (y > yMax) {
                scaledY = scaleY(yMax);
                clipped = true;
            } else if (y < yMin) {
                scaledY = scaleY(yMin);
                clipped = true;
            }

            // Add point if it's within bounds or if the previous point was within bounds (to draw clipped line)
            if (!clipped || (lastY !== null && lastY >= yMin && lastY <= yMax)) {
                 points.push(`${scaledX},${scaledY}`);
            }
            // If current point is clipped but previous wasn't, add the clipped point again to ensure line segment is drawn
            else if (clipped && lastY !== null && lastY >= yMin && lastY <= yMax) {
                 points.push(`${scaledX},${scaledY}`);
            }


            lastY = y; // Update last actual y value
        }
        return points.join(' ');
    };

    const currentFunction = activations[selectedFunction];
    const plotPoints = generatePlotPoints(currentFunction);
    const outputValue = currentFunction(inputValue);

    // Input point coordinates, handling potential clipping for output point y
    const inputX = scaleX(inputValue);
    const inputY = scaleY(0); // Input value always shown on x-axis
    const outputX = scaleX(inputValue);
    let outputY = scaleY(outputValue);
    if (outputValue > yMax) outputY = scaleY(yMax);
    if (outputValue < yMin) outputY = scaleY(yMin);


    return React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        padding: "1rem 1rem", // Consistent padding
        fontFamily: "sans-serif" // Keep sans-serif
      }
    }, [
       // Description Text (aligning with other examples)
       React.createElement("p", {
        style: {
          marginBottom: "1rem",
          fontSize: "0.875rem", // Consistent font size
          color: "#4b5563" // Match legend color for consistency
        }
      }, "Select an activation function and use the slider to see how the input value (x) is transformed into the output value f(x)."),

      // Controls Panel (mimicking structure)
      React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column", // Stack controls vertically
          alignItems: "center", // Center controls
          gap: "15px", // Space between control groups
          marginBottom: "1.5rem",
          padding: "1rem",
          backgroundColor: colors.controlBg, // White background
          border: `1px solid ${colors.controlBorder}`, // Light border
          borderRadius: "0.5rem", // Rounded corners
          width: "100%"
        }
      }, [
        // Function Selector Row
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, [
          React.createElement("label", { htmlFor: "activation-select", style: { fontSize: "0.875rem", color: colors.text } }, "Activation Function:"),
          React.createElement("select", {
            id: "activation-select",
            value: selectedFunction,
            onChange: (e) => setSelectedFunction(e.target.value),
            style: { padding: "0.25rem 0.5rem", fontSize: "0.875rem", borderRadius: "4px", border: `1px solid ${colors.controlBorder}` }
          }, Object.keys(activations).map(key =>
            React.createElement("option", { key: key, value: key }, functionDetails[key].name)
          ))
        ]),
         // Input Slider Row
         React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px", width: "80%" } }, [
            React.createElement("label", { htmlFor: "input-slider", style: { fontSize: "0.875rem", color: colors.text } }, "Input (x):"),
            React.createElement("input", {
              id: "input-slider",
              type: "range",
              min: xMin,
              max: xMax,
              step: 0.1,
              value: inputValue,
              onChange: (e) => setInputValue(parseFloat(e.target.value)),
              style: { flexGrow: 1, height: "8px", cursor: "pointer" } // Style slider
            }),
            React.createElement("span", { style: { fontSize: "0.875rem", color: colors.text, minWidth: "40px", textAlign: "right" } }, inputValue.toFixed(1))
          ])
      ]),

       // Function Info Box (styled like equation box)
       React.createElement("div", {
        style: {
          marginBottom: "1.5rem",
          padding: "15px",
          backgroundColor: "white",
          borderRadius: "0.5rem",
          border: `1px solid ${colors.controlBorder}`,
          width: "100%",
          textAlign: "center"
        }
      }, [
         React.createElement("div", { style: { fontSize: "0.875rem", fontWeight: "bold", marginBottom: "5px", color: colors.text } }, `Formula: ${functionDetails[selectedFunction].formula}`),
         React.createElement("div", { style: { fontSize: "0.875rem", color: colors.text } }, functionDetails[selectedFunction].description)
       ]),


      // Visualization Container (styled like matrix container)
       React.createElement("div", {
        style: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "1.5rem",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "0.5rem",
          border: `1px solid ${colors.controlBorder}`,
          width: "100%"
        }
      },[
        // SVG Plot
        React.createElement("svg", { ref: svgRef, width: width, height: height, style: { backgroundColor: "white" } }, [ // Removed border/radius from SVG itself
            // Grid Lines (optional, for better orientation)
            React.createElement("g", { key: "grid" }, [
                // Vertical grid lines
                [-4, -3, -2, -1, 1, 2, 3, 4].map(val => React.createElement("line", { key: `grid-v-${val}`, x1: scaleX(val), y1: plotPadding, x2: scaleX(val), y2: height - plotPadding, stroke: colors.grid, strokeWidth: 1 })),
                // Horizontal grid lines
                [-1, -0.5, 0.5, 1].map(val => React.createElement("line", { key: `grid-h-${val}`, x1: plotPadding, y1: scaleY(val), x2: width - plotPadding, y2: scaleY(val), stroke: colors.grid, strokeWidth: 1 }))
            ]),
            // Axes
            React.createElement("line", { x1: plotPadding, y1: scaleY(0), x2: width - plotPadding, y2: scaleY(0), stroke: colors.axis, strokeWidth: 1.5 }), // X-axis
            React.createElement("line", { x1: scaleX(0), y1: plotPadding, x2: scaleX(0), y2: height - plotPadding, stroke: colors.axis, strokeWidth: 1.5 }), // Y-axis

            // Axis Labels
            React.createElement("text", { x: width - plotPadding + 10, y: scaleY(0) + 4, fontSize: "12", fill: colors.text, textAnchor: "start" }, "x"),
            React.createElement("text", { x: scaleX(0) - 10, y: plotPadding - 8, fontSize: "12", fill: colors.text, textAnchor: "end" }, "f(x)"),

            // Axis Ticks
            [-4, -2, 2, 4].map(val => React.createElement("g", { key: `x-tick-${val}`}, [
                React.createElement("line", { x1: scaleX(val), y1: scaleY(0) - 4, x2: scaleX(val), y2: scaleY(0) + 4, stroke: colors.axis, strokeWidth: 1 }),
                React.createElement("text", { x: scaleX(val), y: scaleY(0) + 16, fontSize: "11", textAnchor: "middle", fill: colors.text }, val)
            ])),
            [-1, 1].map(val => React.createElement("g", { key: `y-tick-${val}`}, [
                React.createElement("line", { x1: scaleX(0) - 4, y1: scaleY(val), x2: scaleX(0) + 4, y2: scaleY(val), stroke: colors.axis, strokeWidth: 1 }),
                React.createElement("text", { x: scaleX(0) - 8, y: scaleY(val) + 4, fontSize: "11", textAnchor: "end", fill: colors.text }, val)
            ])),

            // Function Plot
            React.createElement("polyline", {
              points: plotPoints,
              fill: "none",
              stroke: colors.plotLine,
              strokeWidth: 2.5 // Slightly thicker line
            }),

            // Input/Output Visualization Lines
            React.createElement("line", { // Line from input on x-axis to function curve
                x1: inputX, y1: inputY, x2: outputX, y2: outputY,
                stroke: colors.inputPoint, strokeWidth: 1.5, strokeDasharray: "4 2"
            }),
            React.createElement("line", { // Line from function curve to y-axis
                x1: outputX, y1: outputY, x2: scaleX(0), y2: outputY,
                stroke: colors.outputPoint, strokeWidth: 1.5, strokeDasharray: "4 2"
            }),

            // Input Point (on x-axis)
            React.createElement("circle", {
              cx: inputX, cy: inputY, r: 5, fill: colors.inputPoint // Slightly larger point
            }),
            // Output Point (on function curve)
            React.createElement("circle", {
              cx: outputX, cy: outputY, r: 5, fill: colors.outputPoint // Slightly larger point
            })
        ])
      ]),


      // Output Display (styled)
      React.createElement("div", {
          style: {
              fontSize: "0.875rem",
              fontWeight: "bold",
              color: colors.text, // Use standard text color
              padding: "0.5rem 1rem",
              backgroundColor: colors.output, // Use output color background
              border: `1px solid ${colors.outputBorder}`,
              borderRadius: "4px"
          }
      },
        `Output f(x): ${outputValue.toFixed(3)}`
      )
    ]);
  };

  // Render the component
  ReactDOM.render(React.createElement(ActivationLayerVisualization), container);
});
