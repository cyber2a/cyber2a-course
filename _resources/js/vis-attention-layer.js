// Import React properly with full paths
import React, { useState, useEffect } from "https://cdn.skypack.dev/react@17.0.1";
import ReactDOM from "https://cdn.skypack.dev/react-dom@17.0.1";

// Simple Chevron components using SVG for expand/collapse
const ChevronRight = () => React.createElement('svg', { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement('polyline', { points: "9 18 15 12 9 6" }));
const ChevronDown = () => React.createElement('svg', { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement('polyline', { points: "6 9 12 15 18 9" }));

// Wait for complete DOM loading
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('attention-layer'); // Use a new ID to avoid conflicts
  if (!container) {
      console.warn("Container element with ID 'attention-layer-conceptual' not found.");
      // Optionally try the old ID for backward compatibility?
      // container = document.getElementById('attention-layer');
      // if (!container) return;
      return;
  }

  // --- High-Level Attention Visualization ---
  const AttentionVisualizationConceptual = () => {
    const [activeStep, setActiveStep] = useState(1);
    const [expandedInfo, setExpandedInfo] = useState({});

    // --- Minimalist Colors ---
    const colors = {
      // Base & Text
      text: '#333333',          // Darker Grey Text
      textLight: '#777777',     // Medium Grey Text
      background: '#ffffff',    // White Background
      border: '#dddddd',        // Light Grey Border
      borderLight: '#eeeeee',   // Very Light Grey Border
      accent: '#007bff',        // Simple Blue Accent
      accentLight: '#e6f2ff',   // Light Blue Accent Background
      accentText: '#ffffff',     // White Text on Accent

      // Element Backgrounds (Mostly white or light grey)
      patchBg: '#f8f9fa',         // Very Light Grey
      embeddingBg: '#f8f9fa',
      positionBg: '#f8f9fa',
      finalEmbeddingBg: '#f8f9fa',
      queryBg: '#f8f9fa',
      keyBg: '#f8f9fa',
      valueBg: '#f8f9fa',
      attentionWeightBg: '#f8f9fa',
      contextBg: '#f8f9fa',

      // Element Borders (Subtle)
      patchBorder: '#dddddd',
      embeddingBorder: '#dddddd',
      positionBorder: '#dddddd',
      finalEmbeddingBorder: '#dddddd',
      queryBorder: '#dddddd',
      keyBorder: '#dddddd',
      valueBorder: '#dddddd',
      attentionBorder: '#dddddd',
      contextBorder: '#dddddd',

      // UI Controls
      controlBg: '#ffffff',
      controlBorder: '#dddddd',
      stepBg: '#ffffff',
      stepBorder: '#dddddd',
      stepHoverBg: '#f8f9fa',     // Very Light Grey Hover
      stepActiveBg: '#e6f2ff',    // Placeholder, will be overwritten
      stepActiveBorder: '#007bff',   // Placeholder, will be overwritten
      stepNumberActiveBg: '#007bff',   // Placeholder, will be overwritten
      stepNumberActiveText: '#ffffff', // Placeholder, will be overwritten
      stepNumberInactiveBg: '#e9ecef', // Lighter Grey for inactive number
      stepNumberInactiveText: '#495057', // Darker Grey for inactive text
      titleText: '#333333',      // Dark Grey Title
      subtitleText: '#555555',   // Medium Grey Subtitle
      explanationBg: '#f8f9fa',   // Very Light Grey Explanation Box
      explanationTitleText: '#333333', // Dark Grey
      arrow: '#777777',         // Medium Grey Arrow
    };

    // Re-assign accent colors if they depend on the main colors object
    colors.stepActiveBg = colors.accentLight;
    colors.stepActiveBorder = colors.accent;
    colors.stepNumberActiveBg = colors.accent;
    colors.stepNumberActiveText = colors.accentText;


    const toggleInfo = (stepId, e) => {
      e.stopPropagation(); // Prevent step click when toggling info
      setExpandedInfo(prev => ({
        ...prev,
        [stepId]: !prev[stepId]
      }));
    };

    const handleStepClick = (stepId) => {
      setActiveStep(stepId);
    };

    // Define steps data (matches user example)
    const steps = [
        { id: 1, title: "Image Patching", details: "The input image is divided into a grid of fixed-size patches (e.g., 16x16 pixels). Each patch is treated as a 'token' like a word in a sentence." },
        { id: 2, title: "Patch Embedding", details: "Each image patch is flattened and linearly projected to create patch embeddings. This converts visual info into a transformer-friendly format." },
        { id: 3, title: "Position Encoding", details: "Positional embeddings are added to patch embeddings to retain spatial information, as transformers don't inherently know patch locations." },
        { id: 4, title: "Self-Attention Computation", details: "For each patch embedding, compute Query (Q), Key (K), and Value (V) vectors. These are used to calculate attention scores." },
        { id: 5, title: "Weight Generation", details: "For each Query vector, compute the dot product and apply a softmax function with all Key vectors. The scores are called attention weights. They determine how much attention (relevance) each patch gets from the query patch." },
        { id: 6, title: "Feature Aggregation", details: "For each patch, after figuring out which parts of the image are relevant (the attention weights), new representation is calculated by multiplying the attention weights with the all Value vectors. The result is summed up to create new, context-aware representations for each patch, incorporating info from relevant patches." }
    ];

    // --- Consistent Styling (Inline CSS using 'colors' object) ---
    const styles = {
        // Overall container - Match conv layer padding
        container: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '1rem'},
        // Main layout flex container
        mainFlex: { display: 'flex', flexDirection: 'row', gap: '24px', width: '100%' }, // Use full width
        // Steps List Container - Minimalist: less prominent border, simpler title
        stepsListContainer: { width: '30%', backgroundColor: colors.controlBg, borderRadius: '0.375rem', padding: '1rem', border: `1px solid ${colors.borderLight}` }, // Lighter border
        stepsListTitle: { fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem' }, // Smaller, less bold title
        stepItem: { position: 'relative', marginBottom: '0.5rem' }, // Reduced margin
        stepButton: { display: 'flex', alignItems: 'center', padding: '0.6rem', borderRadius: '0.25rem', cursor: 'pointer', width: '100%', textAlign: 'left', border: 'none', backgroundColor: 'transparent', transition: 'background-color 0.2s' }, // Slightly less padding
        stepButtonActive: { backgroundColor: colors.stepActiveBg, borderLeft: `3px solid ${colors.stepActiveBorder}`, paddingLeft: 'calc(0.6rem - 3px)' }, // Thinner border
        stepButtonHover: { backgroundColor: colors.stepHoverBg },
        stepNumber: { height: '22px', width: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.6rem', fontSize: '0.8rem', flexShrink: 0 }, // Slightly smaller
        stepNumberActive: { backgroundColor: colors.stepNumberActiveBg, color: colors.stepNumberActiveText },
        stepNumberInactive: { backgroundColor: colors.stepNumberInactiveBg, color: colors.stepNumberInactiveText },
        stepTextContainer: { flexGrow: 1 },
        stepTitle: {color: colors.text, fontSize: '0.8rem'}, // Lighter weight, smaller size
        stepDescription: { fontSize: '0.75rem', color: colors.textLight }, // Slightly smaller
        stepToggleIcon: { marginLeft: '0.5rem', color: colors.textLight, flexShrink: 0 },
        stepDetails: { marginTop: '0.5rem', marginLeft: 'calc(22px + 0.6rem)', padding: '0.6rem', backgroundColor: colors.stepHoverBg, borderRadius: '0.25rem', fontSize: '0.75rem', color: colors.textLight, border: `1px solid ${colors.borderLight}` }, // Lighter border
        // Visualization Container - Match steps list container
        vizContainer: { width: '66.66%', backgroundColor: colors.controlBg, borderRadius: '0.375rem', padding: '1rem', border: `1px solid ${colors.borderLight}` }, // Lighter border
        vizTitle: { fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }, // Match steps list title style
        // Visualization Area - Lighter background and border
        vizArea: { minHeight: '256px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', border: `1px solid ${colors.borderLight}`, borderRadius: '0.25rem', backgroundColor: colors.background }, // White background, lighter border
        // Explanation Box - Minimalist
        vizExplanation: { marginTop: '1rem', padding: '0.6rem', backgroundColor: colors.explanationBg, borderRadius: '0.25rem', border: `1px solid ${colors.borderLight}` }, // Lighter border, less padding
        vizExplanationTitle: { fontWeight: 'bold', color: colors.explanationTitleText, marginBottom: '0.25rem', fontSize: '0.8rem' }, // Less bold
        vizExplanationText: { fontSize: '0.75rem', color: colors.textLight }, // Smaller

        // Visual element styles - Use subtle borders and backgrounds
        box: { display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${colors.border}`, fontSize: '0.7rem', padding: '3px', boxSizing: 'border-box', color: colors.text, borderRadius: '2px' }, // Thinner border, smaller font/padding, slight rounding
        // Specific box types - Use consistent subtle background and border
        patchBox: { backgroundColor: colors.patchBg, borderColor: colors.patchBorder },
        embeddingBox: { backgroundColor: colors.embeddingBg, borderColor: colors.embeddingBorder },
        positionBox: { backgroundColor: colors.positionBg, borderColor: colors.positionBorder },
        finalEmbeddingBox: { backgroundColor: colors.finalEmbeddingBg, borderColor: colors.finalEmbeddingBorder },
        queryBox: { backgroundColor: colors.queryBg, borderColor: colors.queryBorder },
        keyBox: { backgroundColor: colors.keyBg, borderColor: colors.keyBorder },
        valueBox: { backgroundColor: colors.valueBg, borderColor: colors.valueBorder },
        attentionWeightBox: { backgroundColor: colors.attentionWeightBg, borderColor: colors.attentionBorder },
        contextBox: { backgroundColor: colors.contextBg, borderColor: colors.contextBorder },

        // Symbols
        arrow: { color: colors.arrow, margin: '0 8px', fontSize: '1.2rem', fontWeight: 'bold' },
        plus: { fontSize: '1.25rem', margin: '0 8px', color: colors.text },
        equals: { fontSize: '1.25rem', margin: '0 8px', color: colors.text },
        dot: { fontSize: '1.2rem', margin: '0 8px', color: colors.text }, // For dot product symbol
        // Text below visualization
        vizTextCenter: { textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem',  },
    };

    // --- Render Visual for Each Step ---
    const renderStepVisual = (stepId) => {
        // Helper to create a styled box
        const createBox = (text, styleKey, height = '35px', width = '80px', extraStyles = {}) =>
            React.createElement('div', { style: { ...styles.box, ...styles[styleKey], height, width, ...extraStyles } }, text);

        switch (stepId) {
            case 1: // Image Patching
                return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
                    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 40px)', gap: '2px', marginBottom: '1rem' } },
                        Array(16).fill().map((_, i) => createBox('', 'patchBox', '40px', '40px', { key: i }))
                    ),
                    React.createElement('div', { style: styles.vizTextCenter }, 'Input image divided into 16 patches')
                );
            case 2: // Patch Embedding
                return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center' } },
                        createBox('', 'patchBox', '35px', '35px', { writingMode: 'vertical-rl', textOrientation: 'mixed', title: "Flattened Patch" }),
                        React.createElement('span', { style: styles.arrow }, '→'),
                        createBox('', 'patchBox', '35px', '10px', { writingMode: 'vertical-rl', textOrientation: 'mixed', title: "Flattened Patch" }),
                        React.createElement('span', { style: styles.arrow }, '→'),
                        createBox('Embedding', 'embeddingBox')
                    ),
                    React.createElement('div', { style: styles.vizTextCenter }, 'Patches are flattened and projected')
                );
            case 3: // Position Encoding
                return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center' } },
                        createBox('Patch Embeddings', 'embeddingBox'),
                        React.createElement('span', { style: styles.plus }, '+'),
                        createBox('Position Encodings', 'positionBox'),
                        React.createElement('span', { style: styles.equals }, '='),
                        createBox('Final Embeddings', 'finalEmbeddingBox')
                    ),
                    React.createElement('div', { style: styles.vizTextCenter }, 'Position encodings added')
                );
            case 4: // Self-Attention Computation (QKV)
                return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
                    React.createElement('div', { style: { display: 'flex', gap: '16px' } },
                        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
                            createBox('Emb 1', 'finalEmbeddingBox', '25px', '100px'),
                            createBox('Emb 2', 'finalEmbeddingBox', '25px', '100px'),
                            createBox('...', 'finalEmbeddingBox', '25px', '100px', { opacity: 0.5 }),
                            createBox('Emb N', 'finalEmbeddingBox', '25px', '100px')
                        ),
                        React.createElement('span', { style: styles.arrow }, '→'),
                        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
                            createBox('Q', 'queryBox', '25px', '60px'),
                            createBox('K', 'keyBox', '25px', '60px'),
                            createBox('V', 'valueBox', '25px', '60px')
                        )
                    ),
                    React.createElement('div', { style: styles.vizTextCenter }, 'Computing Q, K, V for each patch')
                );
            case 5: // Weight Generation
                 return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' } },
                        createBox('Qᵢ', 'queryBox', '30px', '50px'),
                        React.createElement('span', { style: styles.dot }, '·'),
                        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
                            createBox('K₁', 'keyBox', '20px', '50px'),
                            createBox('K₂', 'keyBox', '20px', '50px'),
                            createBox('...', 'keyBox', '20px', '50px', { opacity: 0.5 }),
                            createBox('Kₙ', 'keyBox', '20px', '50px')
                        ),
                        React.createElement('span', { style: styles.arrow }, '→'),
                         React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
                            createBox('Score₁', 'attentionWeightBox', '20px', '50px'),
                            createBox('Score₂', 'attentionWeightBox', '20px', '50px'),
                            createBox('...', 'attentionWeightBox', '20px', '50px', { opacity: 0.5 }),
                            createBox('Scoreₙ', 'attentionWeightBox', '20px', '50px')
                        )
                    ),
                    React.createElement('div', { style: styles.vizTextCenter }, 'Attention weights (Scores) calculated via Q·Kᵀ + Softmax')
                );
            case 6: // Feature Aggregation
                 return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
                            createBox('Score₁', 'attentionWeightBox', '20px', '50px'),
                            createBox('Score₂', 'attentionWeightBox', '20px', '50px'),
                            createBox('...', 'attentionWeightBox', '20px', '50px', { opacity: 0.5 }),
                            createBox('Scoreₙ', 'attentionWeightBox', '20px', '50px')
                        ),
                         React.createElement('span', { style: styles.dot }, '·'),
                         React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
                            createBox('V₁', 'valueBox', '20px', '50px'),
                            createBox('V₂', 'valueBox', '20px', '50px'),
                            createBox('...', 'valueBox', '20px', '50px', { opacity: 0.5 }),
                            createBox('Vₙ', 'valueBox', '20px', '50px')
                        ),
                        React.createElement('span', { style: styles.equals }, '='),
                        createBox('New Repr. for patch i', 'contextBox', '40px', '100px')
                    ),
                    React.createElement('div', { style: styles.vizTextCenter }, 'Weighted aggregation of Value vectors (Scores·V)')
                );
            default:
                return React.createElement('div', { style: { color: colors.textLight } }, 'Select a step from the left.');
        }
    };

    // --- Main Component Render (Using styles object) ---
    return React.createElement('div', { style: styles.container },
      React.createElement('div', { style: styles.mainFlex },
        // Steps List
        React.createElement('div', { style: styles.stepsListContainer },
          React.createElement('h3', { style: styles.stepsListTitle, align: 'center' }, 'Process Flow'),
          React.createElement('ul', { style: { listStyle: 'none', padding: 0, margin: 0 } },
            steps.map(step => {
              const isActive = activeStep === step.id;
              const isExpanded = expandedInfo[step.id];
              let buttonStyle = { ...styles.stepButton }; // Start with base style
              if (isActive) {
                buttonStyle = { ...buttonStyle, ...styles.stepButtonActive };
              }

              return React.createElement('li', { key: step.id, style: styles.stepItem },
                React.createElement('button', {
                  style: buttonStyle,
                  onClick: () => handleStepClick(step.id),
                  onMouseEnter: (e) => { if (!isActive) e.currentTarget.style.backgroundColor = styles.stepButtonHover.backgroundColor; },
                  onMouseLeave: (e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }
                },
                  React.createElement('div', { style: { ...styles.stepNumber, ...(isActive ? styles.stepNumberActive : styles.stepNumberInactive) } }, step.id),
                  React.createElement('div', { style: styles.stepTextContainer },
                    React.createElement('div', { style: styles.stepTitle }, step.title),
                    React.createElement('div', { style: styles.stepDescription }, step.description)
                  )
                ),
                isExpanded && React.createElement('div', { style: styles.stepDetails }, step.details)
              );
            })
          )
        ),
        // Visualization Area
        React.createElement('div', { style: styles.vizContainer },
          React.createElement('h3', { style: styles.vizTitle }, steps.find(s => s.id === activeStep)?.title || 'Visualization'), // Add fallback title
          React.createElement('div', { style: styles.vizArea },
            renderStepVisual(activeStep)
          ),
          React.createElement('div', { style: styles.vizExplanation },
            React.createElement('h4', { style: styles.vizExplanationTitle }, "What's happening:"),
            React.createElement('p', { style: styles.vizExplanationText }, steps.find(s => s.id === activeStep)?.details || 'Details for the selected step.') // Add fallback text
          )
        )
      )
    );
  };

  // Render the component
  ReactDOM.render(React.createElement(AttentionVisualizationConceptual), container);
});
