
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Calendar, 
  ArrowRightCircle 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  linkTo: string;
}

const StatCard = ({ title, value, change, icon, linkTo }: StatCardProps) => (
  <Link to={linkTo}>
    <Card className="relative overflow-hidden bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="absolute right-0 top-0 h-16 w-16 translate-x-4 -translate-y-4 transform rounded-full bg-brand-purple/10 opacity-70"></div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-1 text-2xl font-semibold">{value}</h3>
          {change && (
            <p className="mt-1 text-xs font-medium text-green-600">{change}</p>
          )}
        </div>
        <div className="rounded-full bg-brand-purple/10 p-3 text-brand-purple">
          {icon}
        </div>
      </div>
      <div className="mt-4 text-sm font-medium text-brand-purple flex items-center">
        Ver detalhes <ArrowRightCircle size={16} className="ml-1" />
      </div>
    </Card>
  </Link>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    revenueThisMonth: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch total products
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Fetch total orders
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        // Fetch total customers
        const { count: customersCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });

        // Fetch current month revenue
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        
        const { data: monthlyOrders } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', firstDayOfMonth.toISOString());

        const revenueThisMonth = monthlyOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

        // Fetch recent orders
        const { data: recentOrdersData } = await supabase
          .from('orders')
          .select(`
            id,
            customer_name,
            total_amount,
            status,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        // Generate fake sales data for the chart
        const salesData = [];
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const currentMonth = currentDate.getMonth();

        for (let i = 5; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12;
          salesData.push({
            name: months[monthIndex],
            vendas: Math.floor(Math.random() * 10000) + 5000,
            alugueis: Math.floor(Math.random() * 8000) + 3000,
          });
        }

        setStats({
          totalProducts: productsCount || 0,
          totalOrders: ordersCount || 0,
          totalCustomers: customersCount || 0,
          revenueThisMonth: revenueThisMonth,
        });

        setRecentOrders(recentOrdersData || []);
        setSalesData(salesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <AdminLayout title="Dashboard">
      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Produtos"
          value={stats.totalProducts}
          icon={<ShoppingBag size={24} />}
          linkTo="/admin/products"
        />
        <StatCard
          title="Pedidos"
          value={stats.totalOrders}
          icon={<ShoppingCart size={24} />}
          linkTo="/admin/orders"
        />
        <StatCard
          title="Clientes"
          value={stats.totalCustomers}
          icon={<Users size={24} />}
          linkTo="/admin/customers"
        />
        <StatCard
          title="Receita do Mês"
          value={formatCurrency(stats.revenueThisMonth)}
          change="+5% em relação ao mês anterior"
          icon={<TrendingUp size={24} />}
          linkTo="/admin/orders"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales chart */}
        <Card className="col-span-2 overflow-hidden bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Vendas dos últimos 6 meses</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-brand-purple"></div>
                <span className="text-xs text-gray-600">Vendas</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-brand-purple/60"></div>
                <span className="text-xs text-gray-600">Aluguéis</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(value) => `R$${value / 1000}k`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [`${formatCurrency(Number(value))}`, undefined]}
                />
                <Bar dataKey="vendas" fill="#b982ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="alugueis" fill="#d7b8ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent orders */}
        <Card className="overflow-hidden bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h3 className="text-lg font-semibold">Pedidos Recentes</h3>
          </div>
          <div className="divide-y">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/admin/orders/${order.id}`}
                  className="block px-6 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status === 'completed'
                          ? 'Concluído'
                          : order.status === 'processing'
                          ? 'Em processamento'
                          : 'Pendente'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                Nenhum pedido recente encontrado
              </div>
            )}
          </div>
          <div className="border-t px-6 py-3">
            <Link
              to="/admin/orders"
              className="flex items-center justify-center text-sm font-medium text-brand-purple"
            >
              Ver todos os pedidos <ArrowRightCircle size={16} className="ml-1" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent activities */}
      <Card className="mt-8 overflow-hidden bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Próximos Eventos</h3>
          <Link to="/admin/calendar" className="text-sm font-medium text-brand-purple">
            Ver agenda completa
          </Link>
        </div>
        <div className="divide-y">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-start py-4">
              <div className="mr-4 rounded-md bg-brand-purple/10 p-2">
                <Calendar size={24} className="text-brand-purple" />
              </div>
              <div>
                <h4 className="font-medium">Entrega para Ana Souza</h4>
                <p className="text-sm text-gray-500">
                  {new Date(Date.now() + item * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')} às 14:00
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AdminLayout>
  );
};

export default Dashboard;
