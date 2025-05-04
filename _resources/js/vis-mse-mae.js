// Import React properly with full paths
import React, { useState, useEffect } from "https://cdn.skypack.dev/react@17.0.1";
import ReactDOM from "https://cdn.skypack.dev/react-dom@17.0.1";

// Wait for complete DOM loading
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('vis-mse-mae');
  if (!container) return;
  
  // MSE vs MAE Visualization Component
  const MSEvsMaeVisualization = () => {
    // State variables
    const [errorRange, setErrorRange] = useState(4);
    const [valueCount, setValueCount] = useState(100);
    const [predictions, setPredictions] = useState([]);
    const [selectedPoint, setSelectedPoint] = useState(null);
    
    // Colors
    const colors = {
      mse: '#ff7875',
      mae: '#5cdbd3',
      axis: '#d9d9d9',
      grid: '#f0f0f0',
      background: '#ffffff',
      text: '#4b5563',
      point: '#1890ff'
    };
    
    // Dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Generate data points
    useEffect(() => {
      const points = [];
      const step = errorRange * 2 / (valueCount - 1);
      
      for (let i = 0; i < valueCount; i++) {
        const error = -errorRange + (i * step);
        const mse = Math.pow(error, 2);
        const mae = Math.abs(error);
        
        points.push({
          error,
          mse,
          mae
        });
      }
      
      setPredictions(points);
    }, [errorRange, valueCount]);
    
    // Scale error value to x position
    const scaleX = (error) => {
      return (error + errorRange) * width / (errorRange * 2);
    };
    
    // Scale error metric to y position
    const scaleY = (value) => {
      // Max value is errorRange^2 (for MSE)
      return height - (value * height / (errorRange * errorRange));
    };
    
    // Format number with at most 2 decimal places
    const formatNumber = (num) => {
      return Math.round(num * 100) / 100;
    };
    
    // Handle mouse move over chart
    const handleMouseMove = (e) => {
      if (!predictions.length) return;
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - margin.left;
      
      // Find closest point
      const errorValue = (x / width) * (errorRange * 2) - errorRange;
      const step = errorRange * 2 / (valueCount - 1);
      const index = Math.round((errorValue + errorRange) / step);
      
      if (index >= 0 && index < predictions.length) {
        setSelectedPoint(predictions[index]);
      }
    };
    
    // Handle mouse leave
    const handleMouseLeave = () => {
      setSelectedPoint(null);
    };
    
    // Render chart
    return React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "90%",
        padding: "1rem 1rem",
        fontFamily: "Arial, sans-serif"
      }
    }, [
      // Controls
      React.createElement("div", {
        style: {
          display: "flex",
          marginBottom: "1.5rem",
          gap: "2rem",
          alignItems: "center",
          padding: "1rem",
          backgroundColor: "white",
          borderRadius: "0.5rem",
          border: "1px solid #e5e7eb",
          width: "100%"
        }
      }, [
        // Error range control
        React.createElement("div", {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }
        }, [
          React.createElement("label", {
            style: {
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              color: colors.text
            }
          }, `Error Range: ±${errorRange}`),
          React.createElement("input", {
            type: "range",
            min: "1",
            max: "10",
            step: "1",
            value: errorRange,
            onChange: (e) => setErrorRange(Number(e.target.value)),
            style: {
              width: "180px"
            }
          })
        ])
      ]),
      
      // Chart container
      React.createElement("div", {
        style: {
          position: "relative",
          width: `${width + margin.left + margin.right}px`,
          height: `${height + margin.top + margin.bottom}px`,
          backgroundColor: colors.background,
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        },
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave
      }, [
        // SVG for chart
        React.createElement("svg", {
          width: width + margin.left + margin.right,
          height: height + margin.top + margin.bottom
        }, [
          // Group for margins
          React.createElement("g", {
            transform: `translate(${margin.left}, ${margin.top})`
          }, [
            // X axis
            React.createElement("line", {
              x1: 0,
              y1: height,
              x2: width,
              y2: height,
              stroke: colors.axis,
              strokeWidth: 1
            }),
            
            // Y axis
            React.createElement("line", {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: height,
              stroke: colors.axis,
              strokeWidth: 1
            }),
            
            // X grid lines and labels
            ...Array.from({ length: 9 }, (_, i) => {
              const value = -errorRange + (i * errorRange / 2);
              const x = scaleX(value);
              
              return [
                // Grid line
                React.createElement("line", {
                  key: `x-grid-${i}`,
                  x1: x,
                  y1: 0,
                  x2: x,
                  y2: height,
                  stroke: colors.grid,
                  strokeWidth: 1
                }),
                
                // Label
                React.createElement("text", {
                  key: `x-label-${i}`,
                  x: x,
                  y: height + 15,
                  textAnchor: "middle",
                  alignmentBaseline: "hanging",
                  fontSize: "0.75rem",
                  fill: colors.text
                }, formatNumber(value))
              ];
            }).flat(),
            
            // Y grid lines and labels
            ...Array.from({ length: 5 }, (_, i) => {
              const value = (errorRange * errorRange * i / 4);
              const y = scaleY(value);
              
              return [
                // Grid line
                React.createElement("line", {
                  key: `y-grid-${i}`,
                  x1: 0,
                  y1: y,
                  x2: width,
                  y2: y,
                  stroke: colors.grid,
                  strokeWidth: 1
                }),
                
                // Label
                React.createElement("text", {
                  key: `y-label-${i}`,
                  x: -10,
                  y: y,
                  textAnchor: "end",
                  alignmentBaseline: "middle",
                  fontSize: "0.75rem",
                  fill: colors.text
                }, formatNumber(value))
              ];
            }).flat(),
            
            // X axis label
            React.createElement("text", {
              x: width / 2,
              y: height + 40,
              textAnchor: "middle",
              fontSize: "0.875rem",
              fontWeight: "bold",
              fill: colors.text
            }, "Error (predicted - actual)"),
            
            // Y axis label
            React.createElement("text", {
              x: -40,
              y: height / 2,
              textAnchor: "middle",
              transform: `rotate(-90, -40, ${height / 2})`,
              fontSize: "0.875rem",
              fontWeight: "bold",
              fill: colors.text
            }, "Error Metric Value"),
            
            // MAE line
            React.createElement("path", {
              d: predictions.map((p, i) => 
                `${i === 0 ? 'M' : 'L'} ${scaleX(p.error)} ${scaleY(p.mae)}`
              ).join(' '),
              stroke: colors.mae,
              strokeWidth: 2,
              fill: "none"
            }),
            
            // MSE line
            React.createElement("path", {
              d: predictions.map((p, i) => 
                `${i === 0 ? 'M' : 'L'} ${scaleX(p.error)} ${scaleY(p.mse)}`
              ).join(' '),
              stroke: colors.mse,
              strokeWidth: 2,
              fill: "none"
            }),
            
            // Selected point markers (if any)
            selectedPoint && [
              // MSE point
              React.createElement("circle", {
                key: "mse-point",
                cx: scaleX(selectedPoint.error),
                cy: scaleY(selectedPoint.mse),
                r: 5,
                fill: colors.mse
              }),
              
              // MAE point
              React.createElement("circle", {
                key: "mae-point",
                cx: scaleX(selectedPoint.error),
                cy: scaleY(selectedPoint.mae),
                r: 5,
                fill: colors.mae
              }),
              
              // Vertical line at error value
              React.createElement("line", {
                key: "v-line",
                x1: scaleX(selectedPoint.error),
                y1: 0,
                x2: scaleX(selectedPoint.error),
                y2: height,
                stroke: colors.point,
                strokeWidth: 1,
                strokeDasharray: "4 4"
              })
            ]
          ])
        ]),
        
        // Legend
        React.createElement("div", {
          style: {
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            border: `1px solid ${colors.grid}`,
            borderRadius: "0.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }
        }, [
          React.createElement("div", {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }
          }, [
            React.createElement("div", {
              style: {
                width: "12px",
                height: "3px",
                backgroundColor: colors.mse
              }
            }),
            React.createElement("span", {
              style: {
                fontSize: "0.875rem",
                color: colors.text
              }
            }, "MSE = (error)²")
          ]),
          
          React.createElement("div", {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }
          }, [
            React.createElement("div", {
              style: {
                width: "12px",
                height: "3px",
                backgroundColor: colors.mae
              }
            }),
            React.createElement("span", {
              style: {
                fontSize: "0.875rem",
                color: colors.text
              }
            }, "MAE = |error|")
          ])
        ]),
        
        // Info box for selected point
        selectedPoint && React.createElement("div", {
          style: {
            position: "absolute",
            top: margin.top + 10,
            left: margin.left + 10,
            padding: "10px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: `1px solid ${colors.grid}`,
            borderRadius: "0.25rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            fontSize: "0.875rem",
            color: colors.text
          }
        }, [
          React.createElement("div", {
            style: { marginBottom: "4px" }
          }, `Error: ${formatNumber(selectedPoint.error)}`),
          React.createElement("div", {
            style: { marginBottom: "4px", color: colors.mse }
          }, `MSE: ${formatNumber(selectedPoint.mse)}`),
          React.createElement("div", {
            style: { color: colors.mae }
          }, `MAE: ${formatNumber(selectedPoint.mae)}`)
        ])
      ]),
    ]);
  };
  
  // Render the component
  ReactDOM.render(
    React.createElement(MSEvsMaeVisualization),
    container
  );
});
