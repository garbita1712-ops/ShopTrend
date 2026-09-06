'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

interface AddProductFormProps {
  onProductAdded: () => void;
}

export default function AddProductForm({ onProductAdded }: AddProductFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [availableCategories, setAvailableCategories] = useState<CategoryItem[]>([]);
  const [activeSubcategories, setActiveSubcategories] = useState<Subcategory[]>([]);

  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [desc, setDesc] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data: CategoryItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailableCategories(data);
          const firstCat = data[0];
          setCategory(firstCat.name);

          if (firstCat.subcategories && firstCat.subcategories.length > 0) {
            setActiveSubcategories(firstCat.subcategories);
            setSubcategory(firstCat.subcategories[0].name);
          } else {
            setActiveSubcategories([]);
            setSubcategory('');
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleCategoryChange = (selectedCatName: string) => {
    setCategory(selectedCatName);
    const found = availableCategories.find((c) => c.name === selectedCatName);
    if (found && found.subcategories && found.subcategories.length > 0) {
      setActiveSubcategories(found.subcategories);
      setSubcategory(found.subcategories[0].name);
    } else {
      setActiveSubcategories([]);
      setSubcategory('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading('Uploading image to Cloudinary...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data && data.url) {
        setImage(data.url);
        toast.success('Image uploaded to Cloudinary!', { id: toastId });
      } else {
        toast.error('Image upload failed', { id: toastId });
      }
    } catch (err) {
      toast.error('Error uploading image', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProd = {
      name: name || 'New Item',
      category: category || 'General',
      subcategory: subcategory || '',
      price: parseFloat(price) || 99.99,
      image: image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
      description: desc || '',
      stock: 15,
    };

    const toastId = toast.loading('Publishing product...');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd),
      });
      if (res.ok) {
        toast.success('Product published!', { id: toastId });
        onProductAdded();
      } else {
        toast.error('Failed to publish product', { id: toastId });
      }
    } catch (e) {
      toast.error('Error connecting to backend', { id: toastId });
    }

    setName('');
    setPrice('');
    setImage('');
    setDesc('');
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Add Product</h2>

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
          <input
            type="text"
            required
            placeholder="Desk Lamp"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
          />
        </div>

        {/* Category & Subcategory Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category</label>
            {availableCategories.length > 0 ? (
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 font-medium"
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
              />
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subcategory</label>
            {activeSubcategories.length > 0 ? (
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 font-medium"
              >
                {activeSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                disabled
                placeholder="None available"
                className="w-full bg-slate-100 border border-slate-200 rounded px-3 py-2 text-slate-400 italic cursor-not-allowed"
              />
            )}
          </div>
        </div>

        {/* Price & Image Upload Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Price ($)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="99.99"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Upload File (Cloudinary)</label>
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={handleFileUpload}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 text-[11px] focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/... (or uploaded above)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Description</label>
          <textarea
            rows={3}
            placeholder="Product specs..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all cursor-pointer"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}
