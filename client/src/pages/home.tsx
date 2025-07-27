import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sweet } from "@shared/schema";
import Navigation from "@/components/navigation";
import ProductCard from "@/components/product-card";
import AuthModal from "@/components/auth-modal";
import CartModal from "@/components/cart-modal";
import { Candy, Cookie, CircleDot, Square } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showCartModal, setShowCartModal] = useState(false);

  // Fetch all sweets
  const { data: sweets = [], isLoading } = useQuery<Sweet[]>({
    queryKey: ["sweets"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/sweets");
      return res.json();
    },
  });

  // Filter sweets based on search and category
  const filteredSweets = sweets.filter(sweet => {
    // Search filter - checks both name and description
    const matchesSearch = searchQuery 
      ? sweet.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        sweet.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    // Category filter
    const matchesCategory = selectedCategory 
      ? sweet.category === selectedCategory
      : true;
    
    return matchesSearch && matchesCategory;
  });

  // Sort the filtered sweets
const sortedSweets = [...filteredSweets].sort((a, b) => {
  const priceA = parseFloat(a.price);
  const priceB = parseFloat(b.price);
  
  switch (sortBy) {
    case "price":
      return priceA - priceB;
    case "price-high":
      return priceB - priceA;
    case "price-range":
      // Define price ranges
      const getPriceRange = (price: number) => {
        if (price < 100) return 0;
        if (price < 200) return 1;
        if (price < 300) return 2;
        if (price < 400) return 3;
        if (price < 500) return 4;
        if (price < 600) return 5;
        if (price < 700) return 6;
        if (price < 800) return 7;
        if (price < 900) return 8;
        if (price < 1000) return 9;
        return 10; // 1000+
      };
      
      const rangeA = getPriceRange(priceA);
      const rangeB = getPriceRange(priceB);
      
      // First sort by range
      if (rangeA !== rangeB) return rangeA - rangeB;
      
      // If same range, sort by actual price (low to high)
      return priceA - priceB;
    case "name":
    default:
      return a.name.localeCompare(b.name);
  }
}); 

  const categories = [
    {
      id: "mithai",
      name: "Mithai",
      description: "Traditional milk-based sweets",
      icon: Candy,
      color: "from-orange-50 to-orange-100",
      iconBg: "bg-primary",
      count: sweets.filter(s => s.category === "mithai").length,
    },
    {
      id: "laddu",
      name: "Laddu",
      description: "Round ball-shaped delicacies",
      icon: CircleDot,
      color: "from-yellow-50 to-yellow-100",
      iconBg: "bg-secondary",
      count: sweets.filter(s => s.category === "laddu").length,
    },
    {
      id: "halwa",
      name: "Halwa",
      description: "Dense, sweet confections",
      icon: Cookie,
      color: "from-red-50 to-red-100",
      iconBg: "bg-accent",
      count: sweets.filter(s => s.category === "halwa").length,
    },
    {
      id: "barfi",
      name: "Barfi",
      description: "Square-cut milk sweets",
      icon: Square,
      color: "from-purple-50 to-purple-100",
      iconBg: "bg-purple-600",
      count: sweets.filter(s => s.category === "barfi").length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onShowLogin={() => {
          setAuthMode("login");
          setShowAuthModal(true);
        }}
        onShowRegister={() => {
          setAuthMode("register");
          setShowAuthModal(true);
        }}
        onShowCart={() => setShowCartModal(true)}
      />

      {/* Hero Section */}
      <section className="relative hero-gradient">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div 
          style={{
            backgroundImage: "url('https://pixabay.com/get/ga379dafed22b5a85890e3ed22e4e8e158c50bb257f41c3cac1ee8877865484964ed743b2cfe51090c94dc6c4e7f6afa204d642bc1ffd47ee601d036000d4afbf_1280.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
          className="relative min-h-[500px] flex items-center"
        >
          <div className="absolute inset-0 hero-gradient opacity-80"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Authentic Indian Sweets
            </h2>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Experience the rich tradition of Indian confectionery with our handcrafted sweets made from the finest ingredients
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Browse Our Sweets
              </button>
            
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Sweet Categories</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our diverse range of traditional Indian sweets, each crafted with authentic recipes passed down through generations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={category.id}
                  className={`group cursor-pointer ${selectedCategory === category.id ? 'ring-2 ring-primary rounded-2xl' : ''}`}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? "" : category.id)}
                >
                  <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1`}>
                    <div className={`w-16 h-16 ${category.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="text-white text-2xl" size={24} />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                    <div className="mt-3 text-sm text-primary font-medium">
                      {category.count} varieties →
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section id="products" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Featured Sweets</h3>
              <p className="text-lg text-gray-600">Handpicked favorites from our collection</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price (Low to High)</option>
                <option value="price-high">Sort by Price (High to Low)</option>
                <option value="price-range">Sort by Price Range</option>
              </select>
              
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                  }}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
</div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sortedSweets.map((sweet) => (
                <ProductCard key={sweet.id} sweet={sweet} />
              ))}
            </div>
          )}

          {!isLoading && sortedSweets.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">🍬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No sweets found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedCategory 
                  ? "Try adjusting your search or filter criteria"
                  : "No sweets are currently available"
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 hero-gradient rounded-lg flex items-center justify-center">
                  <Candy className="text-white text-lg" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Sweet Delights</h1>
                  <p className="text-xs text-gray-400">Premium Indian Sweets</p>
                </div>
              </div>
              <p className="text-gray-300">
                Bringing you the finest traditional Indian sweets crafted with authentic recipes and premium ingredients.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Home</a></li>
                <li><a href="#products" className="text-gray-300 hover:text-primary transition-colors">Products</a></li>
                {/* <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Contact</a></li> */}
              </ul>
            </div>

           

            <div>
              <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-primary">📍</span>
                  <span className="text-gray-300">Ahmedabad, Gujarat, India</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-primary">📞</span>
                  <span className="text-gray-300">+91 8758129102</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-primary">✉️</span>
                  <span className="text-gray-300">hemjshah052@gmail.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            {/* <p className="text-gray-400">
              &copy; 2025 Sweet Delights. All rights reserved. Made with ❤️ for sweet lovers.
            </p> */}
          </div>
        </div>
      </footer>

      <AuthModal
        isVisible={showAuthModal}
        mode={authMode}
        onClose={() => setShowAuthModal(false)}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />

      <CartModal
        isVisible={showCartModal}
        onClose={() => setShowCartModal(false)}
      />
    </div>
  );
}