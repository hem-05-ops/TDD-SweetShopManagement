import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sweet } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import Navigation from "@/components/navigation";
import ProductCard from "@/components/product-card";
import AddSweetModal from "@/components/add-sweet-modal";
import { Link } from "wouter";
import { ShoppingCart, Package, DollarSign, AlertTriangle, Plus, LayersIcon, ListChecks } from "lucide-react";

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: sweets = [] } = useQuery<Sweet[]>({
    queryKey: ["/api/sweets"],
  });

  // Redirect if not admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation
          searchQuery=""
          onSearchChange={() => {}}
          onShowLogin={() => {}}
          onShowRegister={() => {}}
          onShowCart={() => {}}
        />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
            <Link href="/" className="text-primary hover:text-orange-600">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalProducts = sweets.length;
  const lowStockItems = sweets.filter(sweet => sweet.quantity < 10).length;
  const outOfStockItems = sweets.filter(sweet => sweet.quantity === 0).length;
  const totalRevenue = "₹15,240"; // This would come from orders data

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "from-primary to-orange-600",
    },
  
    {
      title: "Low Stock Items",
      value: lowStockItems,
      icon: AlertTriangle,
      color: "from-red-500 to-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        searchQuery=""
        onSearchChange={() => {}}
        onShowLogin={() => {}}
        onShowRegister={() => {}}
        onShowCart={() => {}}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-lg text-gray-600">Manage your sweet shop inventory and orders</p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.title} className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <IconComponent className="text-2xl text-white/60" size={32} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-8 mb-12 shadow-sm">
          <h4 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-white p-4 rounded-xl hover:bg-orange-600 transition-colors text-left group"
            >
              <Plus className="mb-2 text-xl group-hover:scale-110 transition-transform" size={24} />
              <h5 className="font-semibold">Add New Sweet</h5>
              <p className="text-sm text-orange-100">Add a new product to inventory</p>
            </button>
            
            {/* <button className="bg-green-500 text-white p-4 rounded-xl hover:bg-green-600 transition-colors text-left group">
              <LayersIcon className="mb-2 text-xl group-hover:scale-110 transition-transform" size={24} />
              <h5 className="font-semibold">Bulk Restock</h5>
              <p className="text-sm text-green-100">Update inventory quantities</p>
            </button>
            
            <button className="bg-secondary text-white p-4 rounded-xl hover:bg-yellow-600 transition-colors text-left group">
              <ListChecks className="mb-2 text-xl group-hover:scale-110 transition-transform" size={24} />
              <h5 className="font-semibold">View Orders</h5>
              <p className="text-sm text-yellow-100">Manage customer orders</p>
            </button> */}
          </div>
        </div>

        {/* Products Management */}
        <div className="bg-white rounded-2xl shadow-sm mb-12">
          <div className="p-6 border-b">
            <h4 className="text-xl font-semibold text-gray-900">Manage Products</h4>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sweets.map((sweet) => (
                <ProductCard key={sweet.id} sweet={sweet} isAdmin={true} />
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-yellow-600 mr-3" size={24} />
              <h4 className="text-lg font-semibold text-yellow-800">Low Stock Alert</h4>
            </div>
            <p className="text-yellow-700 mb-4">
              {lowStockItems} item(s) are running low on stock. Consider restocking soon.
            </p>
            <div className="space-y-2">
              {sweets
                .filter(sweet => sweet.quantity < 10)
                .map(sweet => (
                  <div key={sweet.id} className="flex justify-between items-center bg-white rounded-lg p-3">
                    <span className="font-medium">{sweet.name}</span>
                    <span className="text-sm text-gray-600">{sweet.quantity} remaining</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <AddSweetModal
        isVisible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
