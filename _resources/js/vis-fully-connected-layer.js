  // Import React properly with full paths
  import React, { useState } from "https://cdn.skypack.dev/react@17.0.1";
  import ReactDOM from "https://cdn.skypack.dev/react-dom@17.0.1";

  // Wait for complete DOM loading
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('vis-fc-layer');
    if (!container) return;
    
    // Neural Network Visualization Component
    const NeuralNetworkVisualization = () => {
      const [layers, setLayers] = useState([3, 4, 2]);
      const [showAllConnections, setShowAllConnections] = useState(false);
      const [hoveredNeuron, setHoveredNeuron] = useState(null);
      const [tooltipContent, setTooltipContent] = useState(null);
      const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
      
      // Colors
      const colors = {
        input: 'rgba(106, 183, 255, 1)', 
        hidden: 'rgba(255, 158, 106, 1)',
        output: 'rgba(106, 255, 158, 1)',
        connection: 'rgba(150, 150, 150, 0.3)',
        highlightedConnection: 'rgba(255, 100, 100, 0.7)',
        text: 'rgba(0, 0, 0, 0.7)'
      };
      
      // Dimensions
      const width = 600;
      const height = 400;
      const neuronRadius = 15;
      const layerSpacing = width / (layers.length + 1);
      
      // Generate neurons for each layer
      const generateNeurons = () => {
        const neurons = [];
        
        layers.forEach((neuronCount, layerIndex) => {
          const layerX = layerSpacing * (layerIndex + 1);
          const isInputLayer = layerIndex === 0;
          const isOutputLayer = layerIndex === layers.length - 1;
          const layerColor = isInputLayer ? colors.input : (isOutputLayer ? colors.output : colors.hidden);
          
          // Calculate vertical spacing
          const totalLayerHeight = neuronCount * 2 * neuronRadius;
          const verticalSpacing = Math.min(60, (height - totalLayerHeight) / (neuronCount + 1));
          const layerStartY = (height - (neuronCount * (2 * neuronRadius + verticalSpacing) - verticalSpacing)) / 2;
          
          for (let i = 0; i < neuronCount; i++) {
            const y = layerStartY + i * (2 * neuronRadius + verticalSpacing);
            
            neurons.push({
              id: `${layerIndex}-${i}`,
              x: layerX,
              y: y + neuronRadius,
              layerIndex,
              neuronIndex: i,
              color: layerColor
            });
          }
        });
        
        return neurons;
      };
      
      // Generate connections between neurons
      const generateConnections = (neurons) => {
        const connections = [];
        
        for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex++) {
          const currentLayerNeurons = neurons.filter(n => n.layerIndex === layerIndex);
          const nextLayerNeurons = neurons.filter(n => n.layerIndex === layerIndex + 1);
          
          currentLayerNeurons.forEach(source => {
            nextLayerNeurons.forEach(target => {
              connections.push({
                id: `${source.id}-${target.id}`,
                source,
                target,
                highlighted: false
              });
            });
          });
        }
        
        return connections;
      };
      
      const neurons = generateNeurons();
      const connections = generateConnections(neurons);
      
      // Handle neuron hover
      const highlightConnections = (neuronId) => {
        return connections.map(conn => {
          let highlighted = false;
          
          if (neuronId) {
            if (conn.source.id === neuronId || conn.target.id === neuronId) {
              highlighted = true;
            }
          }
          
          return { ...conn, highlighted };
        });
      };
      
      const handleNeuronHover = (neuron) => {
        setHoveredNeuron(neuron.id);
        
        // Create equation tooltip content based on neuron type
        let equation = "";
        if (neuron.layerIndex === 0) {
          // Input neuron
          equation = `x_{${neuron.neuronIndex + 1}} = \\text{input}`;
        } else if (neuron.layerIndex === layers.length - 1 && layers.length > 2) {
          // Output neuron
          equation = `y_{${neuron.neuronIndex + 1}} = \\sum_{j=1}^{n} w_{${neuron.neuronIndex + 1}j}^{(${neuron.layerIndex-1})} \\cdot h_{j}^{(${neuron.layerIndex-1})} + b_{${neuron.neuronIndex + 1}}`;
        } else if (neuron.layerIndex === layers.length - 1 && layers.length === 2) {
          // Output neuron
          equation = `y_{${neuron.neuronIndex + 1}} = \\sum_{j=1}^{n} w_{${neuron.neuronIndex + 1}j} \\cdot x_j + b_{${neuron.neuronIndex + 1}}`;
        } else if (neuron.layerIndex === 1) {
          // First hidden layer
          equation = `h_{${neuron.neuronIndex + 1}}^{(${neuron.layerIndex})} = \\sum_{j=1}^{n} w_{${neuron.neuronIndex + 1}j} \\cdot x_j + b_{${neuron.neuronIndex + 1}}`;
        } else  {
          // Hidden neuron
          equation = `h_{${neuron.neuronIndex + 1}}^{(${neuron.layerIndex})} = \\sum_{j=1}^{n} w_{${neuron.neuronIndex + 1}j} \\cdot h_{j}^{(${neuron.layerIndex-1})} + b_{${neuron.neuronIndex + 1}}`;
        }
        
        setTooltipContent(equation);
        setTooltipPosition({ x: neuron.x + 20, y: neuron.y - 10 });
      };
      
      const handleNeuronLeave = () => {
        setHoveredNeuron(null);
        setTooltipContent(null);
      };
      
      const highlightedConnections = hoveredNeuron ? highlightConnections(hoveredNeuron) : connections;
      
      // Layer control functions
      const addLayer = () => {
        if (layers.length < 5) {
          setLayers([...layers, 3]);
        }
      };
      
      const removeLayer = () => {
        if (layers.length > 2) {
          setLayers(layers.slice(0, -1));
        }
      };
      
      const updateLayerSize = (index, delta) => {
        const newLayers = [...layers];
        const newSize = Math.max(1, Math.min(5, newLayers[index] + delta));
        newLayers[index] = newSize;
        setLayers(newLayers);
      };
      
      // Convert JSX to React.createElement
      return React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          padding: "1rem 1rem",
        }
      }, [
        // description
        React.createElement("p", {
          style: {
            marginBottom: "1rem",
            fontSize: "0.875rem", // Consistent font size
            color: "#4b5563" // Match legend color for consistency
          }
        }, "Hover over a neuron to see its connections. In a fully connected network, each neuron connects to every neuron in the adjacent layers."),

        // Control panel
        React.createElement("div", {
          style: {
            marginBottom: "1rem",
            padding: "1rem",
            width: "100%"
          }
        }, [     
          // Controls row
          React.createElement("div", {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem"
            }
          }, [
            // Show all connections toggle
            React.createElement("div", {
              style: {
                display: "flex",
                alignItems: "center"
              }
            }, [
              React.createElement("span", {
                style: {
                  marginRight: "0.5rem",
                  fontSize: "0.875rem" // Consistent font size
                }
              }, "Show all connections"),
              React.createElement("input", {
                type: "checkbox",
                checked: showAllConnections,
                onChange: () => setShowAllConnections(!showAllConnections),
                style: {
                  height: "1rem",
                  width: "1rem"
                }
              })
            ]),
            
            // Layer buttons
            React.createElement("div", {
              style: {
                display: "flex",
                gap: "0.5rem"
              }
            }, [
              React.createElement("button", {
                onClick: removeLayer,
                disabled: layers.length <= 2,
                style: {
                  padding: "0.25rem 0.5rem",
                  backgroundColor: "#fee2e2",
                  color: "#b91c1c",
                  borderRadius: "0.25rem",
                  opacity: layers.length <= 2 ? "0.5" : "1",
                  cursor: layers.length <= 2 ? "not-allowed" : "pointer",
                  border: "none",
                  fontSize: "0.875rem" // Consistent font size
                }
              }, "Remove Layer"),
              React.createElement("button", {
                onClick: addLayer,
                disabled: layers.length >= 5,
                style: {
                  padding: "0.25rem 0.5rem",
                  backgroundColor: "#dcfce7",
                  color: "#15803d",
                  borderRadius: "0.25rem",
                  opacity: layers.length >= 5 ? "0.5" : "1",
                  cursor: layers.length >= 5 ? "not-allowed" : "pointer",
                  border: "none",
                  fontSize: "0.875rem" // Consistent font size
                }
              }, "Add Layer")
            ])
          ]),
          
          // Layer size controls (per layer)
          React.createElement("div", {
            style: {
              display: "flex", 
              justifyContent: "space-between",
              marginBottom: "0.5rem",
              paddingLeft: `${layerSpacing/2}px`,
              paddingRight: `${layerSpacing/2}px`
            }
          }, layers.map((count, idx) => 
            React.createElement("div", {
              key: idx,
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.25rem" // Add gap for spacing
              }
            }, [
              // Layer Title (Input/Hidden/Output)
              React.createElement("div", {
                style: { fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" } // Consistent font size + style
              }, idx === 0 ? "Input" : idx === layers.length - 1 ? "Output" : `Hidden ${idx}`),
              // Layer Size Adjuster (+/- buttons and count)
              React.createElement("div", {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem"
                }
              }, [
                React.createElement("button", {
                  onClick: () => updateLayerSize(idx, -1),
                  disabled: count <= 1,
                  style: {
                    width: "1.25rem",
                    height: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "0.25rem",
                    opacity: count <= 1 ? "0.5" : "1",
                    cursor: count <= 1 ? "not-allowed" : "pointer",
                    border: "none",
                    fontSize: "0.875rem" // Consistent font size
                  }
                }, "-"),
                // Neuron Count Display
                React.createElement("span", {
                  style: {
                    width: "1.5rem", // Slightly wider for double digits
                    textAlign: "center",
                    fontSize: "0.875rem" // Consistent font size
                  }
                }, count),
                // Increment Button
                React.createElement("button", {
                  onClick: () => updateLayerSize(idx, 1),
                  disabled: count >= 5, // Match max size logic in updateLayerSize
                  style: {
                    width: "1.25rem",
                    height: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "0.25rem",
                    opacity: count >= 6 ? "0.5" : "1",
                    cursor: count >= 6 ? "not-allowed" : "pointer",
                    border: "none",
                    fontSize: "0.875rem" // Consistent font size
                  }
                }, "+")
              ])
            ])
          ))
        ]),
        
        // SVG visualization container
        React.createElement("div", {
          style: {
            position: "relative",
            width: "100%",
            height: height,
            display: "flex",
            justifyContent: "center"
          }
        }, [
          React.createElement("svg", {
            width: width,
            height: height,
            style: {
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              backgroundColor: "white",
              maxWidth: "100%"
            }
          }, [
            // Connections
            React.createElement("g", { key: "connections" },
              highlightedConnections.map(conn => {
                // Only render connections that are highlighted or if showAllConnections is true
                if (!conn.highlighted && !showAllConnections) return null;
                
                return React.createElement("line", {
                  key: conn.id,
                  x1: conn.source.x,
                  y1: conn.source.y,
                  x2: conn.target.x,
                  y2: conn.target.y,
                  stroke: conn.highlighted ? colors.highlightedConnection : colors.connection,
                  strokeWidth: conn.highlighted ? 2 : 1
                });
              })
            ),
            
            // Layer labels
            React.createElement("g", { key: "labels" },
              layers.map((_, idx) => 
                React.createElement("text", {
                  key: `label-${idx}`,
                  x: layerSpacing * (idx + 1),
                  y: 30,
                  textAnchor: "middle",
                  fill: colors.text,
                  fontSize: "0.875rem" // Consistent font size
                }, idx === 0 ? "Input Layer" : idx === layers.length - 1 ? "Output Layer" : `Hidden Layer ${idx}`)
              )
            ),
            
            // Neurons group
            React.createElement("g", { key: "neurons" },
              neurons.map(neuron => 
                React.createElement("circle", {
                  key: neuron.id,
                  cx: neuron.x,
                  cy: neuron.y,
                  r: neuronRadius,
                  fill: neuron.color,
                  stroke: hoveredNeuron === neuron.id ? "#000" : "none",
                  strokeWidth: 2,
                  onMouseEnter: () => handleNeuronHover(neuron),
                  onMouseLeave: handleNeuronLeave,
                  style: { cursor: "pointer" }
                })
              )
            )
          ]),
          
          // Tooltip for equation
          tooltipContent && React.createElement("div", {
            style: {
              position: "absolute",
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              color: "white",
              padding: "5px 10px",
              borderRadius: "4px",
              zIndex: 1000,
              pointerEvents: "none",
              maxWidth: "220px"
            },
            dangerouslySetInnerHTML: { 
              __html: `\\(${tooltipContent}\\)` 
            },
            ref: node => {
              if (node) {
                // Try to render math if MathJax is available
                if (typeof window !== 'undefined' && window.MathJax) {
                  window.MathJax.typeset([node]);
                }
              }
            }
          })
        ]),
        
        // Legend
        React.createElement("div", {
          style: {
            color: "#4b5563"
          }
        }, [
          React.createElement("div", {
            style: {
              display: "flex",
              justifyContent: "center",
              marginTop: "1rem",
              gap: "1.25rem"
            }
          }, [
            React.createElement("div", {
              style: { display: "flex", alignItems: "center" }
            }, [
              React.createElement("div", {
                style: {
                  width: "0.75rem",
                  height: "0.75rem",
                  borderRadius: "9999px",
                  backgroundColor: colors.input,
                  marginRight: "0.25rem"
                }
              }),
              React.createElement("span", { style: { fontSize: "0.875rem" } }, "Input Layer") // Consistent font size
            ]),
            React.createElement("div", {
              style: { display: "flex", alignItems: "center" }
            }, [
              React.createElement("div", {
                style: {
                  width: "0.75rem",
                  height: "0.75rem",
                  borderRadius: "9999px",
                  backgroundColor: colors.hidden,
                  marginRight: "0.25rem"
                }
              }),
              React.createElement("span", { style: { fontSize: "0.875rem" } }, "Hidden Layers") // Consistent font size
            ]),
            React.createElement("div", {
              style: { display: "flex", alignItems: "center" }
            }, [
              React.createElement("div", {
                style: {
                  width: "0.75rem",
                  height: "0.75rem",
                  borderRadius: "9999px",
                  backgroundColor: colors.output,
                  marginRight: "0.25rem"
                }
              }),
              React.createElement("span", { style: { fontSize: "0.875rem" } }, "Output Layer") // Consistent font size
            ])
          ])
        ])
      ]);
    };
    
    // Render the component directly after DOM is ready
    ReactDOM.render(React.createElement(NeuralNetworkVisualization), container);
    // Removed setTimeout as DOMContentLoaded already ensures container exists
  });
