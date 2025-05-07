// Import React properly with full paths
import React, { useState, useEffect } from "https://cdn.skypack.dev/react@17.0.1";
import ReactDOM from "https://cdn.skypack.dev/react-dom@17.0.1";

// Wait for complete DOM loading
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('vis-pooling-layer');
  if (!container) return;

  // Pooling Layer Visualization Component
  const PoolingLayerVisualization = () => {
    // State variables
    const [inputSize, setInputSize] = useState(6);
    const [poolSize, setPoolSize] = useState(2);
    const [stride, setStride] = useState(2);
    const [poolType, setPoolType] = useState('max'); // 'max' or 'avg'
    const [poolPosition, setPoolPosition] = useState({ x: 0, y: 0 });
    const [animating, setAnimating] = useState(false);
    const [highlightedCells, setHighlightedCells] = useState([]);
    const [showOutput, setShowOutput] = useState(true);
    const [showCalculation, setShowCalculation] = useState(false);

    // Colors
    const colors = {
      input: '#e6f7ff',
      inputBorder: '#91d5ff',
      poolWindow: '#fffbe6', // Light yellow for pooling window
      poolWindowBorder: '#ffe58f',
      highlighted: '#ffffb8', // Keep highlighted color consistent
      highlightedBorder: '#faad14',
      output: '#f6ffed',
      outputBorder: '#b7eb8f',
      text: '#262626',
      controlBg: '#fafafa',
      controlBorder: '#d9d9d9'
    };

    // Dimensions
    const cellSize = 40;
    const spacing = 80;

    // Calculate output size based on pooling formula
    const outputSize = Math.floor((inputSize - poolSize) / stride) + 1;

    // Generate random input matrix (values between 0 and 1)
    const generateRandomMatrix = (size) => {
      const matrix = [];
      for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
          row.push(Math.round(Math.random() * 100) / 100);
        }
        matrix.push(row);
      }
      return matrix;
    };

    // Initialize random matrices
    const [inputMatrix, setInputMatrix] = useState(generateRandomMatrix(inputSize));
    const [outputMatrix, setOutputMatrix] = useState(Array(outputSize).fill().map(() => Array(outputSize).fill(0)));

    // Regenerate input matrix when inputSize changes
    useEffect(() => {
      setInputMatrix(generateRandomMatrix(inputSize));
      resetPoolPosition();
      // Output matrix size depends on inputSize, recalculate
      setOutputMatrix(Array(outputSize).fill().map(() => Array(outputSize).fill(0)));
    }, [inputSize]);

    // Reset pool position and recalculate output when poolSize or stride changes
    useEffect(() => {
      resetPoolPosition();
      // Output matrix size depends on poolSize and stride, recalculate
      setOutputMatrix(Array(outputSize).fill().map(() => Array(outputSize).fill(0)));
    }, [poolSize, stride]);

    // Reset pool position to top-left
    const resetPoolPosition = () => {
      setPoolPosition({ x: 0, y: 0 });
      setHighlightedCells([]);
    };

    // Calculate which input cells are currently covered by the pooling window
    useEffect(() => {
      const newHighlightedCells = [];
      for (let i = 0; i < poolSize; i++) {
        for (let j = 0; j < poolSize; j++) {
          const inputRow = poolPosition.y + i;
          const inputCol = poolPosition.x + j;
          if (inputRow < inputSize && inputCol < inputSize) {
            newHighlightedCells.push({ row: inputRow, col: inputCol });
          }
        }
      }
      setHighlightedCells(newHighlightedCells);
    }, [poolPosition, poolSize, inputSize]);

    // Calculate current output value at pool position
    const calculateOutputValue = () => {
      const valuesInWindow = [];
      for (let i = 0; i < poolSize; i++) {
        for (let j = 0; j < poolSize; j++) {
          const inputRow = poolPosition.y + i;
          const inputCol = poolPosition.x + j;
          if (inputRow < inputSize && inputCol < inputSize) {
            valuesInWindow.push(inputMatrix[inputRow][inputCol]);
          }
        }
      }

      if (valuesInWindow.length === 0) return 0;

      let result;
      if (poolType === 'max') {
        result = Math.max(...valuesInWindow);
      } else { // 'avg'
        const sum = valuesInWindow.reduce((acc, val) => acc + val, 0);
        result = sum / valuesInWindow.length;
      }
      return Math.round(result * 100) / 100;
    };

    // Update output matrix with current calculation
    useEffect(() => {
      const outputRow = Math.floor(poolPosition.y / stride);
      const outputCol = Math.floor(poolPosition.x / stride);

      if (outputRow >= 0 && outputRow < outputSize &&
          outputCol >= 0 && outputCol < outputSize) {
        const newOutput = outputMatrix.map(row => [...row]); // Deep copy
        newOutput[outputRow][outputCol] = calculateOutputValue();
        setOutputMatrix(newOutput);
      }
    }, [highlightedCells, inputMatrix, poolType]); // Re-calculate when highlighted cells, input, or poolType changes

    // Animate pool window movement across input
    const animatePooling = () => {
      setAnimating(true);
      resetPoolPosition();

      const maxPositionsX = Math.floor((inputSize - poolSize) / stride) + 1;
      const maxPositionsY = Math.floor((inputSize - poolSize) / stride) + 1;
      const totalSteps = maxPositionsX * maxPositionsY;
      let currentStep = 0;

      const animation = setInterval(() => {
        if (currentStep < totalSteps) {
          setPoolPosition(prev => {
            const currentOutputCol = Math.floor(prev.x / stride);
            const currentOutputRow = Math.floor(prev.y / stride);

            let nextX = prev.x + stride;
            let nextY = prev.y;

            if (nextX > inputSize - poolSize) {
              nextX = 0;
              nextY = prev.y + stride;
            }

            // Ensure nextY doesn't exceed bounds
            if (nextY > inputSize - poolSize) {
               // Should not happen if totalSteps is correct, but as a safeguard
               clearInterval(animation);
               setAnimating(false);
               return prev; // Stay at the last valid position
            }

            return { x: nextX, y: nextY };
          });
          currentStep++;
        } else {
          clearInterval(animation);
          setAnimating(false);
        }
      }, 500); // Animation speed in ms

      return () => clearInterval(animation);
    };

    // Render a grid cell
    const renderCell = (value, row, col, type, isHighlighted = false) => {
      let bgColor = colors[type];
      let borderColor = colors[`${type}Border`];

      if (isHighlighted) {
        bgColor = colors.highlighted;
        borderColor = colors.highlightedBorder;
      }

      return React.createElement("div", {
        key: `${type}-${row}-${col}`,
        style: {
          width: `${cellSize}px`,
          height: `${cellSize}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: bgColor,
          border: `1px solid ${borderColor}`,
          fontSize: "0.75rem", // Consistent font size (12px)
          position: "relative"
        }
      }, value);
    };

    // Render a matrix
    const renderMatrix = (matrix, type) => {
      const matrixSize = matrix.length;

      return React.createElement("div", {
        style: {
          display: "inline-block",
          marginRight: type !== "output" ? `${spacing}px` : "0",
          position: "relative" // Needed for positioning the pool window overlay
        }
      }, [
        // Matrix label
        React.createElement("div", {
          style: {
            textAlign: "center",
            marginBottom: "10px",
            fontWeight: "bold",
            fontSize: "0.875rem" // Consistent font size (14px)
          }
        }, type === "input" ? "Input Feature Map" : "Output Feature Map"),

        // Matrix grid
        React.createElement("div", {
          style: {
            display: "inline-grid",
            gridTemplateColumns: `repeat(${matrixSize}, ${cellSize}px)`,
            gridGap: "1px",
            padding: "5px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px"
          }
        }, matrix.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            // Check if this cell is highlighted (covered by the pool window)
            const isHighlighted = type === "input" && highlightedCells.some(h => h.row === rowIndex && h.col === colIndex);
            return renderCell(cell, rowIndex, colIndex, type, isHighlighted);
          })
        )),
      ]);
    };

    // Create calculation string
    const getCalculationString = () => {
        const valuesInWindow = [];
        let calculationStr = "";
        for (let i = 0; i < poolSize; i++) {
            for (let j = 0; j < poolSize; j++) {
                const inputRow = poolPosition.y + i;
                const inputCol = poolPosition.x + j;
                if (inputRow < inputSize && inputCol < inputSize) {
                    valuesInWindow.push(inputMatrix[inputRow][inputCol]);
                    calculationStr += `${inputMatrix[inputRow][inputCol]}, `;
                }
            }
        }
        calculationStr = calculationStr.slice(0, -2); // Remove trailing comma and space

        if (valuesInWindow.length === 0) return "Window out of bounds";

        const result = calculateOutputValue();
        if (poolType === 'max') {
            return `Max(${calculationStr}) = ${result}`;
        } else { // 'avg'
            return `Avg(${calculationStr}) = ${result}`;
        }
    };

    // Manual pool window movement controls
    const movePoolWindow = (dx, dy) => {
      if (animating) return;

      setPoolPosition(prev => {
        const nextX = prev.x + dx * stride;
        const nextY = prev.y + dy * stride;

        // Boundary checks
        const boundedX = Math.max(0, Math.min(nextX, inputSize - poolSize));
        const boundedY = Math.max(0, Math.min(nextY, inputSize - poolSize));

        return { x: boundedX, y: boundedY };
      });
    };

    return React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        padding: "1rem 1rem" // Consistent padding
      }
    }, [
      // description
      React.createElement("p", {
        style: {
          marginBottom: "1rem",
          fontSize: "0.875rem", // Consistent font size
          color: "#4b5563" // Match legend color for consistency
        }
      }, "Adjust parameters to see how the pooling operation reduces the feature map size. Select Max or Average pooling."),

      // Controls panel
      React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginBottom: "1.5rem",
          padding: "1rem",
          backgroundColor: "white",
          width: "100%"
        }
      }, [
        // First row of controls
        React.createElement("div", {
          style: {
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "15px",
            marginBottom: "15px"
          }
        }, [
          // Input size control
          React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" } }, [
            React.createElement("label", { style: { fontSize: "0.875rem", marginBottom: "5px" } }, "Input Size"),
            React.createElement("div", { style: { display: "flex", alignItems: "center" } }, [
              React.createElement("button", { onClick: () => inputSize > poolSize && setInputSize(inputSize - 1), disabled: inputSize <= poolSize, style: { padding: "0.25rem 0.5rem", cursor: inputSize <= poolSize ? "not-allowed" : "pointer", opacity: inputSize <= poolSize ? 0.5 : 1, fontSize: "0.875rem" } }, "-"),
              React.createElement("span", { style: { margin: "0 10px", width: "20px", textAlign: "center" } }, inputSize),
              React.createElement("button", { onClick: () => inputSize < 10 && setInputSize(inputSize + 1), disabled: inputSize >= 10, style: { padding: "0.25rem 0.5rem", cursor: inputSize >= 10 ? "not-allowed" : "pointer", opacity: inputSize >= 10 ? 0.5 : 1, fontSize: "0.875rem" } }, "+")
            ])
          ]),

          // Pool size control
          React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" } }, [
            React.createElement("label", { style: { fontSize: "0.875rem", marginBottom: "5px" } }, "Pool Size"),
            React.createElement("div", { style: { display: "flex", alignItems: "center" } }, [
              React.createElement("button", { onClick: () => poolSize > 1 && setPoolSize(poolSize - 1), disabled: poolSize <= 1, style: { padding: "0.25rem 0.5rem", cursor: poolSize <= 1 ? "not-allowed" : "pointer", opacity: poolSize <= 1 ? 0.5 : 1, fontSize: "0.875rem" } }, "-"),
              React.createElement("span", { style: { margin: "0 10px", width: "20px", textAlign: "center" } }, poolSize),
              React.createElement("button", { onClick: () => poolSize < inputSize && setPoolSize(poolSize + 1), disabled: poolSize >= inputSize, style: { padding: "0.25rem 0.5rem", cursor: poolSize >= inputSize ? "not-allowed" : "pointer", opacity: poolSize >= inputSize ? 0.5 : 1, fontSize: "0.875rem" } }, "+")
            ])
          ]),

          // Stride control
          React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" } }, [
            React.createElement("label", { style: { fontSize: "0.875rem", marginBottom: "5px" } }, "Stride"),
            React.createElement("div", { style: { display: "flex", alignItems: "center" } }, [
              React.createElement("button", { onClick: () => stride > 1 && setStride(stride - 1), disabled: stride <= 1, style: { padding: "0.25rem 0.5rem", cursor: stride <= 1 ? "not-allowed" : "pointer", opacity: stride <= 1 ? 0.5 : 1, fontSize: "0.875rem" } }, "-"),
              React.createElement("span", { style: { margin: "0 10px", width: "20px", textAlign: "center" } }, stride),
              React.createElement("button", { onClick: () => stride < poolSize + 1 && setStride(stride + 1), disabled: stride >= poolSize + 1, style: { padding: "0.25rem 0.5rem", cursor: stride >= poolSize + 1 ? "not-allowed" : "pointer", opacity: stride >= poolSize + 1 ? 0.5 : 1, fontSize: "0.875rem" } }, "+")
            ])
          ]),

          // Pool type control
          React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" } }, [
            React.createElement("label", { style: { fontSize: "0.875rem", marginBottom: "5px" } }, "Pool Type"),
            React.createElement("select", {
                value: poolType,
                onChange: (e) => setPoolType(e.target.value),
                style: { padding: "0.25rem 0.5rem", fontSize: "0.875rem" }
            }, [
                React.createElement("option", { value: "max" }, "Max Pooling"),
                React.createElement("option", { value: "avg" }, "Average Pooling")
            ])
          ])
        ]),

        // Second row of controls
        React.createElement("div", {
          style: {
            display: "flex",
            justifyContent: "center",
            gap: "40px"
          }
        }, [
          // Show/hide output toggle
          React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" } }, [
            React.createElement("label", { style: { fontSize: "0.875rem", marginBottom: "5px" } }, "Show Output"),
            React.createElement("input", { type: "checkbox", checked: showOutput, onChange: () => setShowOutput(!showOutput), style: { width: "20px", height: "20px" } })
          ]),
          // Show/hide calculation toggle
          React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" } }, [
            React.createElement("label", { style: { fontSize: "0.875rem", marginBottom: "5px" } }, "Show Calculation"),
            React.createElement("input", { type: "checkbox", checked: showCalculation, onChange: () => setShowCalculation(!showCalculation), style: { width: "20px", height: "20px" } })
          ])
        ])
      ]),

      // Show calculation
      showCalculation && React.createElement("div", {
        style: {
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "white",
          borderRadius: "0.5rem",
          border: "1px solid #e5e7eb",
          maxWidth: "800px",
          width: "100%",
          textAlign: "center"
        }
      }, [
        React.createElement("div", { style: { fontSize: "0.875rem", fontWeight: "bold", marginBottom: "10px" } }, "Current Pooling Calculation:"),
        React.createElement("div", { style: { fontSize: "0.875rem", fontFamily: "monospace" } }, getCalculationString()),
        React.createElement("div", { style: { fontSize: "0.875rem", marginTop: "10px" } }, `Output position: [${Math.floor(poolPosition.y / stride)}, ${Math.floor(poolPosition.x / stride)}]`)
      ]),

      // Matrix visualization container
      React.createElement("div", {
        style: {
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start", // Align tops of matrices
          flexWrap: "wrap",
          gap: "40px",
          marginBottom: "20px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "0.5rem",
          border: "1px solid #e5e7eb",
          width: "100%"
        }
      }, [
        // Input matrix
        renderMatrix(inputMatrix, "input"),

        // Output matrix (conditionally rendered)
        showOutput && renderMatrix(outputMatrix, "output")
      ]),

      // Animation control buttons
      React.createElement("div", {
        style: {
          display: "flex",
          gap: "15px",
          marginBottom: "20px"
        }
      }, [
        React.createElement("button", { onClick: resetPoolPosition, disabled: animating, style: { padding: "0.5rem 1rem", backgroundColor: "#f5f5f5", border: "1px solid #d9d9d9", borderRadius: "4px", cursor: animating ? "not-allowed" : "pointer", opacity: animating ? 0.5 : 1, fontSize: "0.875rem" } }, "Reset Position"),
        React.createElement("button", { onClick: animatePooling, disabled: animating, style: { padding: "0.5rem 1rem", backgroundColor: "#1890ff", color: "white", border: "none", borderRadius: "4px", cursor: animating ? "not-allowed" : "pointer", opacity: animating ? 0.5 : 1, fontSize: "0.875rem" } }, animating ? "Animating..." : "Animate Pooling")
      ]),

      // Manual pool window movement controls
      React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "white",
          borderRadius: "0.5rem",
          border: "1px solid #e5e7eb",
          width: "100%",
          maxWidth: "400px"
        }
      }, [
        React.createElement("div", { style: { fontSize: "0.875rem", marginBottom: "10px", fontWeight: "bold" } }, "Manual Window Movement (by Stride)"),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 40px)", gridTemplateRows: "repeat(3, 40px)", gap: "5px" } }, [
          React.createElement("div", {}), // Top-left empty
          React.createElement("button", { onClick: () => movePoolWindow(0, -1), disabled: animating || poolPosition.y === 0, style: { cursor: (animating || poolPosition.y === 0) ? "not-allowed" : "pointer", opacity: (animating || poolPosition.y === 0) ? 0.5 : 1 } }, "↑"),
          React.createElement("div", {}), // Top-right empty
          React.createElement("button", { onClick: () => movePoolWindow(-1, 0), disabled: animating || poolPosition.x === 0, style: { cursor: (animating || poolPosition.x === 0) ? "not-allowed" : "pointer", opacity: (animating || poolPosition.x === 0) ? 0.5 : 1 } }, "←"),
          React.createElement("div", { style: { display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", borderRadius: "4px", fontSize: "0.75rem" } }, `${poolPosition.x},${poolPosition.y}`),
          React.createElement("button", { onClick: () => movePoolWindow(1, 0), disabled: animating || poolPosition.x >= inputSize - poolSize, style: { cursor: (animating || poolPosition.x >= inputSize - poolSize) ? "not-allowed" : "pointer", opacity: (animating || poolPosition.x >= inputSize - poolSize) ? 0.5 : 1 } }, "→"),
          React.createElement("div", {}), // Bottom-left empty
          React.createElement("button", { onClick: () => movePoolWindow(0, 1), disabled: animating || poolPosition.y >= inputSize - poolSize, style: { cursor: (animating || poolPosition.y >= inputSize - poolSize) ? "not-allowed" : "pointer", opacity: (animating || poolPosition.y >= inputSize - poolSize) ? 0.5 : 1 } }, "↓"),
          React.createElement("div", {}) // Bottom-right empty
        ])
      ]),
    ]);
  };

  // Render the component directly after DOM is ready
  ReactDOM.render(React.createElement(PoolingLayerVisualization), container);
});
