// Import React properly with full paths
import React, { useState, useEffect } from "https://cdn.skypack.dev/react@17.0.1";
import ReactDOM from "https://cdn.skypack.dev/react-dom@17.0.1";

// Wait for complete DOM loading
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('vis-conv-layer');
  if (!container) return;
  
  // Convolutional Neural Network Visualization Component
  const ConvolutionalLayerVisualization = () => {
    // State variables
    const [inputSize, setInputSize] = useState(6);
    const [kernelSize, setKernelSize] = useState(3);
    const [stride, setStride] = useState(1);
    const [padding, setPadding] = useState(0);
    const [kernelPosition, setKernelPosition] = useState({ x: 0, y: 0 });
    const [animating, setAnimating] = useState(false);
    const [showEquation, setShowEquation] = useState(false);
    const [highlightedCells, setHighlightedCells] = useState([]);
    const [showOutput, setShowOutput] = useState(true);
    
    // Colors
    const colors = {
      input: '#e6f7ff',
      inputBorder: '#91d5ff',
      kernel: '#fff2e8',
      kernelBorder: '#ffbb96',
      highlighted: '#ffffb8',
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
    
    // Calculate output size based on convolutional formula
    const outputSize = Math.floor((inputSize + 2 * padding - kernelSize) / stride) + 1;
    
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
    
    // Generate random kernel with values between -1 and 1
    const generateRandomKernel = (size) => {
      const kernel = [];
      for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
          row.push(Math.round((Math.random() * 2 - 1) * 100) / 100);
        }
        kernel.push(row);
      }
      return kernel;
    };
    
    // Initialize random matrices
    const [inputMatrix, setInputMatrix] = useState(generateRandomMatrix(inputSize));
    const [kernelMatrix, setKernelMatrix] = useState(generateRandomKernel(kernelSize));
    const [outputMatrix, setOutputMatrix] = useState(Array(outputSize).fill().map(() => Array(outputSize).fill(0)));
    const [paddedMatrix, setPaddedMatrix] = useState([]);
    
    // Regenerate input and padded matrices when inputSize or padding changes
    useEffect(() => {
      const newInputMatrix = generateRandomMatrix(inputSize);
      setInputMatrix(newInputMatrix);

      if (padding > 0) {
        const paddedSize = inputSize + 2 * padding;
        const newPaddedMatrix = Array(paddedSize).fill().map(() => Array(paddedSize).fill(0));

        for (let i = 0; i < inputSize; i++) {
          for (let j = 0; j < inputSize; j++) {
            // Use the newly generated matrix directly
            newPaddedMatrix[i + padding][j + padding] = newInputMatrix[i][j];
          }
        }
        setPaddedMatrix(newPaddedMatrix);
      } else {
        // If no padding, paddedMatrix is just the inputMatrix
        setPaddedMatrix(newInputMatrix);
      }

      // Reset kernel position whenever input or padding changes
      resetKernelPosition();

      // Output matrix size depends on inputSize and padding, so recalculate it here too.
      // Note: outputSize is calculated outside useEffect, so it should be up-to-date.
      setOutputMatrix(Array(outputSize).fill().map(() => Array(outputSize).fill(0)));

    }, [inputSize, padding]); // Depends only on inputSize and padding
    
    // Keep kernel size effect (and recalculate output)
    useEffect(() => {
      setKernelMatrix(generateRandomKernel(kernelSize));
      resetKernelPosition();
      // Output matrix size also depends on kernelSize, recalculate
      setOutputMatrix(Array(outputSize).fill().map(() => Array(outputSize).fill(0)));
    }, [kernelSize]);
    
    // Keep stride effect (and recalculate output)
    useEffect(() => {
      resetKernelPosition();
      // Output matrix size depends on stride, recalculate
      setOutputMatrix(Array(outputSize).fill().map(() => Array(outputSize).fill(0)));
    }, [stride]);
    
    // Reset kernel position to top-left
    const resetKernelPosition = () => {
      setKernelPosition({ x: 0, y: 0 });
      setHighlightedCells([]);
    };
    
    // Calculate which input cells are currently covered by the kernel
    useEffect(() => {
      const newHighlightedCells = [];
      
      for (let i = 0; i < kernelSize; i++) {
        for (let j = 0; j < kernelSize; j++) {
          const inputRow = kernelPosition.y + i;
          const inputCol = kernelPosition.x + j;
          
          // Add all overlapping cells to the highlighted list
          newHighlightedCells.push({ 
            row: inputRow, 
            col: inputCol,
            isPadding: padding > 0 && (
              inputRow < padding || 
              inputRow >= (inputSize + padding) || 
              inputCol < padding || 
              inputCol >= (inputSize + padding)
            )
          });
          
          // Also add original input cells to maintain backward compatibility
          if (padding > 0) {
            const originalRow = inputRow - padding;
            const originalCol = inputCol - padding;
            if (originalRow >= 0 && originalRow < inputSize && 
                originalCol >= 0 && originalCol < inputSize) {
              newHighlightedCells.push({ 
                row: originalRow, 
                col: originalCol,
                isOriginal: true
              });
            }
          }
        }
      }
      
      setHighlightedCells(newHighlightedCells);
    }, [kernelPosition, kernelSize, inputSize, padding]);
    
    // Calculate current output value at kernel position
    const calculateOutputValue = () => {
      // Check if kernelMatrix is initialized and dimensions match kernelSize
      if (!kernelMatrix || kernelMatrix.length !== kernelSize || (kernelSize > 0 && (!kernelMatrix[0] || kernelMatrix[0].length !== kernelSize))) {
        return 0; // Return 0 during inconsistent state
      }
      
      let sum = 0;
      
      // Each highlighted cell gets multiplied by corresponding kernel value
      for (let i = 0; i < kernelSize; i++) {
        for (let j = 0; j < kernelSize; j++) {
          const inputRow = kernelPosition.y + i;
          const inputCol = kernelPosition.x + j;
          
          if (padding > 0) {
            // For padded matrix, we use the paddedMatrix
            sum += paddedMatrix[inputRow][inputCol] * kernelMatrix[i][j];
          } else {
            // For non-padded matrix, we use the original check
            if (inputRow >= 0 && inputRow < inputSize && 
                inputCol >= 0 && inputCol < inputSize) {
              sum += inputMatrix[inputRow][inputCol] * kernelMatrix[i][j];
            }
          }
        }
      }
      
      return Math.round(sum * 100) / 100;
    };
    
    // Update output matrix with current calculation
    useEffect(() => {
      const outputRow = Math.floor(kernelPosition.y / stride);
      const outputCol = Math.floor(kernelPosition.x / stride);
      
      if (outputRow >= 0 && outputRow < outputSize && 
          outputCol >= 0 && outputCol < outputSize) {
        const newOutput = [...outputMatrix];
        newOutput[outputRow][outputCol] = calculateOutputValue();
        setOutputMatrix(newOutput);
      }
    }, [highlightedCells, kernelMatrix, inputMatrix]);
    
    // Animate kernel movement across input
    const animateConvolution = () => {
      setAnimating(true);
      resetKernelPosition();
      
      // We need to adjust the maxPositions calculation to account for padding
      const effectiveInputSize = inputSize + 2 * padding;
      const maxPositions = Math.ceil((effectiveInputSize - kernelSize + 1) / stride) * 
                           Math.ceil((effectiveInputSize - kernelSize + 1) / stride);
      let currentStep = 0;
      
      const animation = setInterval(() => {
        if (currentStep < maxPositions) {
          setKernelPosition(prev => {
            const maxPosition = inputSize + 2 * padding - kernelSize;
            const newX = (prev.x + stride) % (maxPosition + 1);
            const newY = newX === 0 ? prev.y + stride : prev.y;
            return { x: newX, y: newY };
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
      
      // Special styling for padding cells
      if (type === "padding") {
        bgColor = "#f0f0f0";
        borderColor = "#d9d9d9";
      }
      
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
          marginRight: type !== "output" ? `${spacing}px` : "0"
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
        }, type === "input" ? (padding > 0 ? "Input Matrix (with padding)" : "Input Matrix") : type === "kernel" ? "Kernel" : "Output Matrix"),
        
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
            // Check if this cell is highlighted (for input matrix only)
            const isHighlighted = type === "input" && (
              padding > 0 
                // When showing padded matrix, we need to highlight based on absolute position
                ? highlightedCells.some(h => !h.isOriginal && h.row === rowIndex && h.col === colIndex)
                // When showing original matrix, we highlight based on original positions
                : highlightedCells.some(h => h.isOriginal || (h.row === rowIndex && h.col === colIndex))
            );
            
            // Check if this is a padding cell
            const isPadding = type === "input" && padding > 0 && (
              rowIndex < padding || 
              rowIndex >= (inputSize + padding) || 
              colIndex < padding || 
              colIndex >= (inputSize + padding)
            );
            
            return renderCell(
              cell, 
              rowIndex, 
              colIndex, 
              isPadding ? "padding" : type, 
              isHighlighted
            );
          })
        ))
      ]);
    };
    
    // Create formula string for the convolution operation
    const getConvolutionFormula = () => {
      // Check if kernelMatrix is initialized and dimensions match kernelSize
      if (!kernelMatrix || kernelMatrix.length !== kernelSize || (kernelSize > 0 && (!kernelMatrix[0] || kernelMatrix[0].length !== kernelSize))) {
        return "Calculating formula..."; // Return placeholder during inconsistent state
      }
      
      let formula = "Output[i,j] = ";
      
      for (let m = 0; m < kernelSize; m++) {
        for (let n = 0; n < kernelSize; n++) {
          const kernelValue = kernelMatrix[m][n];
          const sign = kernelValue >= 0 ? "+" : "";
          
          if (m === 0 && n === 0) {
            formula += `${kernelValue} × Input[i+${m},j+${n}] `;
          } else {
            formula += `${sign}${kernelValue} × Input[i+${m},j+${n}] `;
          }
        }
      }
      
      return formula;
    };
    
    // Manual kernel movement controls
    const moveKernel = (dx, dy) => {
      if (animating) return;
      
      setKernelPosition(prev => {
        const maxPosition = inputSize + 2 * padding - kernelSize;
        const newX = Math.max(0, Math.min(prev.x + dx, maxPosition));
        const newY = Math.max(0, Math.min(prev.y + dy, maxPosition));
        return { x: newX, y: newY };
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
      }, "Adjust different parameters to see how they affect the output matrix (feature map)."),
      
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
          React.createElement("div", {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }
          }, [
            React.createElement("label", {
              style: { fontSize: "0.875rem", marginBottom: "5px" } // Consistent font size
            }, "Input Size"),
            React.createElement("div", {
              style: { display: "flex", alignItems: "center" }
            }, [
              React.createElement("button", {
                onClick: () => inputSize > 3 && setInputSize(inputSize - 1),
                disabled: inputSize <= 3,
                style: {
                  padding: "0.25rem 0.5rem", // Consistent padding
                  cursor: inputSize <= 3 ? "not-allowed" : "pointer",
                  opacity: inputSize <= 3 ? 0.5 : 1,
                  fontSize: "0.875rem" // Consistent font size
                }
              }, "-"),
              React.createElement("span", {
                style: { margin: "0 10px", width: "20px", textAlign: "center" }
              }, inputSize),
              React.createElement("button", {
                onClick: () => inputSize < 8 && setInputSize(inputSize + 1),
                disabled: inputSize >= 8,
                style: {
                  padding: "0.25rem 0.5rem", // Consistent padding
                  cursor: inputSize >= 8 ? "not-allowed" : "pointer",
                  opacity: inputSize >= 8 ? 0.5 : 1,
                  fontSize: "0.875rem" // Consistent font size
                }
              }, "+")
            ])
          ]),
          
          // Kernel size control
          React.createElement("div", {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }
          }, [
            React.createElement("label", {
              style: { fontSize: "0.875rem", marginBottom: "5px" } // Consistent font size
            }, "Kernel Size"),
            React.createElement("div", {
              style: { display: "flex", alignItems: "center" }
            }, [
              React.createElement("button", {
                onClick: () => kernelSize > 1 && setKernelSize(kernelSize - 1),
                disabled: kernelSize <= 1,
                style: {
                  padding: "0.25rem 0.5rem", // Consistent padding
                  cursor: kernelSize <= 1 ? "not-allowed" : "pointer",
                  opacity: kernelSize <= 1 ? 0.5 : 1,
                  fontSize: "0.875rem" // Consistent font size
                }
              }, "-"),
              React.createElement("span", {
                style: { margin: "0 10px", width: "20px", textAlign: "center" }
              }, kernelSize),
              React.createElement("button", {
                onClick: () => kernelSize < inputSize - 1 && setKernelSize(kernelSize + 1),
                disabled: kernelSize >= inputSize - 1,
                style: {
                  padding: "0.25rem 0.5rem", // Consistent padding
                  cursor: kernelSize >= inputSize - 1 ? "not-allowed" : "pointer",
                  opacity: kernelSize >= inputSize - 1 ? 0.5 : 1,
                  fontSize: "0.875rem" // Consistent font size
                }
              }, "+")
            ])
          ]),
          
          // Stride control
          React.createElement("div", {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }
          }, [
            React.createElement("label", {
              style: { fontSize: "0.875rem", marginBottom: "5px" } // Consistent font size
            }, "Stride"),
            React.createElement("div", {
              style: { display: "flex", alignItems: "center" }
            }, [
              React.createElement("button", {
                onClick: () => stride > 1 && setStride(stride - 1),
                disabled: stride <= 1,
                style: {
                  padding: "0.25rem 0.5rem", // Consistent padding
                  cursor: stride <= 1 ? "not-allowed" : "pointer",
                  opacity: stride <= 1 ? 0.5 : 1,
                  fontSize: "0.875rem" // Consistent font size
                }
              }, "-"),
              React.createElement("span", {
                style: { margin: "0 10px", width: "20px", textAlign: "center" }
              }, stride),
              React.createElement("button", {
                onClick: () => stride < 3 && setStride(stride + 1),
                disabled: stride >= 3,
                style: {
                  padding: "0.25rem 0.5rem", // Consistent padding
                  cursor: stride >= 3 ? "not-allowed" : "pointer",
                  opacity: stride >= 3 ? 0.5 : 1,
                  fontSize: "0.875rem" // Consistent font size
                }
              }, "+")
            ])
          ]),
          
          // Padding control
          React.createElement("div", {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }
          }, [
            React.createElement("label", {
              style: { fontSize: "0.875rem", marginBottom: "5px" } // Consistent font size
            }, "Padding"),
            React.createElement("div", {
              style: { display: "flex", alignItems: "center" }
            }, [
              React.createElement("button", {
                onClick: () => padding > 0 && setPadding(padding - 1),
                disabled: padding <= 0,
                style: {
                  padding: "0.25rem 0.5rem", // Consistent padding
                  cursor: padding <= 0 ? "not-allowed" : "pointer",
                  opacity: padding <= 0 ? 0.5 : 1,
                  fontSize: "0.875rem" // Consistent font size
                }
              }, "-"),
              React.createElement("span", {
                style: { margin: "0 10px", width: "20px", textAlign: "center" }
              }, padding),
              React.createElement("button", {
                onClick: () => padding < 2 && setPadding(padding + 1),
                disabled: padding >= 2,
                style: {
                  padding: "0.25rem 0.5rem", // Consistent padding
                  cursor: padding >= 2 ? "not-allowed" : "pointer",
                  opacity: padding >= 2 ? 0.5 : 1,
                  fontSize: "0.875rem" // Consistent font size
                }
              }, "+")
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
          React.createElement("div", {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }
          }, [
            React.createElement("label", {
              style: { fontSize: "0.875rem", marginBottom: "5px" } // Consistent font size
            }, "Show Output"),
            React.createElement("input", {
              type: "checkbox",
              checked: showOutput,
              onChange: () => setShowOutput(!showOutput),
              style: {
                width: "20px",
                height: "20px"
              }
            })
          ]),
          
          // Show/hide equation toggle
          React.createElement("div", {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }
          }, [
            React.createElement("label", {
              style: { fontSize: "0.875rem", marginBottom: "5px" } // Consistent font size
            }, "Show Equation"),
            React.createElement("input", {
              type: "checkbox",
              checked: showEquation,
              onChange: () => setShowEquation(!showEquation),
              style: {
                width: "20px",
                height: "20px"
              }
            })
          ])
        ])
      ]),
      
      // Show convolution equation
      showEquation && React.createElement("div", {
        style: {
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "white",
          borderRadius: "0.5rem",
          border: "1px solid #e5e7eb",
          maxWidth: "800px",
          width: "100%"
        }
      }, [
        React.createElement("div", {
          style: {
            fontSize: "0.875rem", // Consistent font size
            fontWeight: "bold",
            marginBottom: "10px"
          }
        }, "Current Convolution Equation:"),
        
        React.createElement("div", {
          style: {
            fontSize: "0.875rem", // Consistent font size
            fontFamily: "monospace"
          }
        }, getConvolutionFormula()),
        
        React.createElement("div", {
          style: {
            fontSize: "0.875rem", // Consistent font size
            marginTop: "10px"
          }
        }, `Current Output Value at position [${Math.floor(kernelPosition.y / stride)},${Math.floor(kernelPosition.x / stride)}]: ${calculateOutputValue()}`)
      ]),
      
      // Matrix visualization container
      React.createElement("div", {
        style: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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
        // Input matrix - show padded matrix when padding > 0
        padding > 0 ? renderMatrix(paddedMatrix, "input") : renderMatrix(inputMatrix, "input"),
        
        // Kernel matrix
        renderMatrix(kernelMatrix, "kernel"),
        
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
        // Reset button
        React.createElement("button", {
          onClick: resetKernelPosition,
          disabled: animating,
          style: {
            padding: "0.5rem 1rem", // Consistent padding
            backgroundColor: "#f5f5f5",
            border: "1px solid #d9d9d9",
            borderRadius: "4px",
            cursor: animating ? "not-allowed" : "pointer",
            opacity: animating ? 0.5 : 1,
            fontSize: "0.875rem" // Consistent font size
          }
        }, "Reset Position"),
        
        // Animate button
        React.createElement("button", {
          onClick: animateConvolution,
          disabled: animating,
          style: {
            padding: "0.5rem 1rem", // Consistent padding
            backgroundColor: "#1890ff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: animating ? "not-allowed" : "pointer",
            opacity: animating ? 0.5 : 1,
            fontSize: "0.875rem" // Consistent font size
          }
        }, animating ? "Animating..." : "Animate Convolution")
      ]),
      
      // Manual kernel movement controls
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
        React.createElement("div", {
          style: {
            fontSize: "0.875rem", // Consistent font size
            marginBottom: "10px",
            fontWeight: "bold"
          }
        }, "Manual Kernel Movement"),
        
        React.createElement("div", {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(3, 40px)",
            gridTemplateRows: "repeat(3, 40px)",
            gap: "5px"
          }
        }, [
          // Empty top-left
          React.createElement("div", {}),
          
          // Up button
          React.createElement("button", {
            onClick: () => moveKernel(0, -1),
            disabled: animating || kernelPosition.y === 0,
            style: {
              cursor: (animating || kernelPosition.y === 0) ? "not-allowed" : "pointer",
              opacity: (animating || kernelPosition.y === 0) ? 0.5 : 1
            }
          }, "↑"),
          
          // Empty top-right
          React.createElement("div", {}),
          
          // Left button
          React.createElement("button", {
            onClick: () => moveKernel(-1, 0),
            disabled: animating || kernelPosition.x === 0,
            style: {
              cursor: (animating || kernelPosition.x === 0) ? "not-allowed" : "pointer",
              opacity: (animating || kernelPosition.x === 0) ? 0.5 : 1
            }
          }, "←"),
          
          // Current position indicator
          React.createElement("div", {
            style: {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              fontSize: "0.75rem" // Consistent font size
            }
          }, `${kernelPosition.x},${kernelPosition.y}`),
          
          // Right button
          React.createElement("button", {
            onClick: () => moveKernel(1, 0),
            disabled: animating || kernelPosition.x >= (inputSize + 2 * padding - kernelSize),
            style: {
              cursor: (animating || kernelPosition.x >= (inputSize + 2 * padding - kernelSize)) ? "not-allowed" : "pointer",
              opacity: (animating || kernelPosition.x >= (inputSize + 2 * padding - kernelSize)) ? 0.5 : 1
            }
          }, "→"),
          
          // Empty bottom-left
          React.createElement("div", {}),
          
          // Down button
          React.createElement("button", {
            onClick: () => moveKernel(0, 1),
            disabled: animating || kernelPosition.y >= (inputSize + 2 * padding - kernelSize),
            style: {
              cursor: (animating || kernelPosition.y >= (inputSize + 2 * padding - kernelSize)) ? "not-allowed" : "pointer",
              opacity: (animating || kernelPosition.y >= (inputSize + 2 * padding - kernelSize)) ? 0.5 : 1
            }
          }, "↓"),
          
          // Empty bottom-right
          React.createElement("div", {})
        ])
      ]),
    ]);
  };
  
  // Render the component directly after DOM is ready
  ReactDOM.render(React.createElement(ConvolutionalLayerVisualization), container);
});
