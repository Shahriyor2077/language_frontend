import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-6 p-8">
                <div className="space-y-2">
                    <h1 className="text-9xl font-bold text-gray-200">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Sahifa topilmadi
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan bo'lishi mumkin.
                    </p>
                </div>
                <div className="flex items-center justify-center gap-4">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Orqaga
                    </Button>
                    <Button asChild>
                        <Link to="/">
                            <Home className="mr-2 h-4 w-4" />
                            Bosh sahifa
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
