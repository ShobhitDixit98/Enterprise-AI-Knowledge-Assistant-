import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Knowledge Base Data (Simulation of Vector DB)
const KNOWLEDGE_BASE = [
  {
    id: '1',
    title: 'Deep Learning',
    author: 'Ian Goodfellow, Yoshua Bengio, and Aaron Courville',
    topics: ['Neural Networks', 'Optimization', 'Convolutional Networks', 'Sequence Modeling'],
    content: 'Deep learning is a form of machine learning that enables computers to learn from experience and understand the world in terms of a hierarchy of concepts. Because the computer gathers knowledge from experience, there is no need for a human computer operator to formally specify all the knowledge needed by the computer. The hierarchy of concepts allows the computer to learn complicated concepts by building them out of simpler ones; a graph of these hierarchies would be many layers deep.'
  },
  {
    id: '2',
    title: 'Hands-on Machine Learning with Scikit-Learn',
    author: 'Aurélien Géron',
    topics: ['Scikit-Learn', 'Keras', 'TensorFlow', 'Ensemble Learning', 'Dimensionality Reduction'],
    content: 'Machine Learning is the science (and art) of programming computers so they can learn from data. Machine Learning is great for problems for which existing solutions require a lot of hand-tuning or long lists of rules: one Machine Learning algorithm can often simplify code and perform better. Training a model means finding a set of internal parameters that make it best fit the training set.'
  },
  {
    id: '3',
    title: 'Interpretable Machine Learning',
    author: 'Christoph Molnar',
    topics: ['Interpretability', 'SHAP', 'LIME', 'PDP', 'Fairness'],
    content: 'Interpretability is the degree to which a human can understand the cause of a decision. In data science, you often want to know WHY an algorithm made a certain prediction. Black-box models like deep neural networks are powerful but hard to explain. Techniques like LIME (Local Interpretable Model-agnostic Explanations) and SHAP (SHapley Additive exPlanations) help bridge this gap.'
  },
  {
    id: '4',
    title: 'Pattern Recognition and Machine Learning',
    author: 'Christopher Bishop',
    topics: ['Bayesian Methods', 'Probability Distributions', 'Linear Models', 'Graphical Models'],
    content: 'The use of Bayesian methods in pattern recognition has seen a significant increase. The Bayesian approach treats parameters as random variables and expresses uncertainty through probability distributions. The marginalization over parameters allows for robust predictions and model comparison without the need for cross-validation in many cases.'
  },
  {
    id: '5',
    title: 'Introduction to Statistical Learning (ISLR)',
    author: 'James, Witten, Hastie, Tibshirani',
    topics: ['Linear Regression', 'Classification', 'Resampling Methods', 'Tree-based Methods'],
    content: 'Statistical learning refers to a vast set of tools for understanding data. These tools can be classified as supervised or unsupervised. In the supervised case, the goal is to predict or estimate an output based on one or more inputs. In the unsupervised case, there are inputs but no supervising output; we can learn relationships and structure from such data.'
  },
  {
    id: '6',
    title: 'Probabilistic Machine Learning',
    author: 'Kevin Murphy',
    topics: ['Probabilistic Graphics', 'Variational Inference', 'Gaussian Processes', 'Bayesian Statistics'],
    content: 'Machine learning is about making predictions from data. The probabilistic approach to ML treats all sources of uncertainty using probability theory. This book provides a comprehensive introduction to the field, covering both the frequentist and Bayesian perspectives, and focuses on state-of-the-art methods like deep generative modeling and reinforcement learning.'
  },
  {
    id: '7',
    title: 'Machine Learning Yearning',
    author: 'Andrew Ng',
    topics: ['Project Strategy', 'Error Analysis', 'Data Synthesis', 'Transfer Learning'],
    content: 'Machine Learning Yearning focuses on how to coordinate your team and structure your Machine Learning projects. It covers how to set up dev and test sets, how to use error analysis to prioritize tasks, and how to handle mismatched training/dev sets. It emphasizes practical strategies for building large-scale systems.'
  },
  {
    id: '8',
    title: 'Dive into Deep Learning',
    author: 'Aston Zhang et al.',
    topics: ['PyTorch', 'MXNet', 'NLP', 'Computer Vision', 'Generative Models'],
    content: 'Dive into Deep Learning is an interactive book with code examples in PyTorch, MXNet, and TensorFlow. It covers everything from basic linear algebra to state-of-the-art transformer models. Each chapter is a Jupyter notebook that you can run to see the concepts in action, reflecting the "learn by doing" philosophy.'
  },
  {
    id: '9',
    title: 'The 100-Page Machine Learning Book',
    author: 'Andriy Burkov',
    topics: ['Core Algorithms', 'Support Vector Machines', 'Gradient Boosting', 'Regularization'],
    content: 'This book is a concise summary of the most important concepts in machine learning. It covers supervised learning, unsupervised learning, and best practices. It is intended for both beginners and experienced practitioners who need a quick reference or a refresh on core algorithms like SVM, decision trees, and neural networks.'
  },
  {
    id: '10',
    title: 'Mathematics for Machine Learning',
    author: 'Deisenroth, Faisal, Ong',
    topics: ['Linear Algebra', 'Calculus', 'Vector Calculus', 'Matrix Decompositions'],
    content: 'The fundamental mathematical pillars of machine learning are linear algebra, analytic geometry, matrix decompositions, vector calculus, optimization, probability and statistics. This book aims to provide the necessary mathematical background for understanding machine learning algorithms, which are often treated as black boxes without considering the underlying math.'
  }
];

// Shared state for custom uploaded documents
let CUSTOM_DOCUMENTS: any[] = [];


async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  
  // Get Library Status
  app.get('/api/library', (req, res) => {
    res.json([...KNOWLEDGE_BASE, ...CUSTOM_DOCUMENTS]);
  });

  // Upload dynamic content to vector store
  app.post('/api/upload', (req, res) => {
    const { name, content, type } = req.body;
    const newDoc = {
      id: `custom-${Math.random().toString(36).substr(2, 9)}`,
      title: name,
      author: 'User Upload',
      content,
      topics: ['Custom Document', type],
      isCustom: true
    };
    CUSTOM_DOCUMENTS.push(newDoc);
    res.json(newDoc);
  });

  // Delete document
  app.delete('/api/documents/:id', (req, res) => {
    const { id } = req.params;
    CUSTOM_DOCUMENTS = CUSTOM_DOCUMENTS.filter(doc => doc.id !== id);
    res.json({ success: true });
  });

  // RAG Search Endpoint with Multi-LLM Support
  app.post('/api/chat', async (req, res) => {
    const { query, model = 'gemini' } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    // 1. Retrieval (Search across BOTH static and custom docs)
    const allDocs = [...KNOWLEDGE_BASE, ...CUSTOM_DOCUMENTS];
    const keywords = query.toLowerCase().split(' ');
    
    const contextDocs = allDocs.map(doc => {
      let score = 0;
      const text = (doc.title + ' ' + (doc.content || '') + ' ' + (doc.topics?.join(' ') || '')).toLowerCase();
      keywords.forEach(word => {
        if (text.includes(word)) score += 1;
        if (doc.title.toLowerCase().includes(word)) score += 2;
      });
      return { ...doc, score };
    })
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4); // Top 4 matches

    const contextText = contextDocs.map(doc => 
      `Source: ${doc.title} by ${doc.author}\nContent: ${doc.content}`
    ).join('\n\n');

    const systemPrompt = `You are a ML Knowledge Assistant. Answer based strictly on context.\n\nContext:\n${contextText}`;

    try {
      let responseText = "";

      if (model === 'claude') {
        const key = process.env.ANTHROPIC_API_KEY;
        if (!key) throw new Error("ANTHROPIC_API_KEY not configured");
        // Simulated Claude request
        responseText = "[Claude Response]: " + "In a real production environment, I would call Anthropic's Messages API here. " + 
                       (contextDocs.length > 0 ? `I see you're asking about ${contextDocs[0].title}.` : "I don't have specific context for that.");
      } else if (model === 'openai') {
        const key = process.env.OPENAI_API_KEY;
        if (!key) throw new Error("OPENAI_API_KEY not configured");
        // Simulated OpenAI request
        responseText = "[OpenAI Response]: " + "In a real production environment, I would call OpenAI's Chat Completions API here. " +
                       (contextDocs.length > 0 ? `Based on the provided ML literature like ${contextDocs[0].title}...` : "Context search returned no hits.");
      } else {
        // Gemini handled client-side for this specific app's architecture OR could be moved here.
        // For simplicity in this demo, we'll keep Gemini as its own flow or bridge it.
        responseText = "BRIDGE_TO_GEMINI"; 
      }

      res.json({ 
        content: responseText, 
        sources: contextDocs,
        modelUsed: model 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', engine: 'Gemini' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
