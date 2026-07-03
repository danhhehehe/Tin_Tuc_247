import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ArticleDetail from './pages/ArticleDetail.jsx';
import Favorites from './pages/Favorites.jsx';
import SourcesAdmin from './pages/SourcesAdmin.jsx';
import About from './pages/About.jsx';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="category/:category" element={<CategoryPage />} />
          <Route path="article/:slug" element={<ArticleDetail />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="sources" element={<SourcesAdmin />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
