import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AbandonedCartReminder } from "./components/AbandonedCartReminder";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { PromoBanner } from "./components/PromoBanner";
import { CartProvider } from "./context/CartContext";
import { UserAuthProvider } from "./context/UserAuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AboutPage } from "./pages/AboutPage";
import { AdminPage } from "./pages/AdminPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { ContactPage } from "./pages/ContactPage";
import { CustomOrdersPage } from "./pages/CustomOrdersPage";
import { FAQPage } from "./pages/FAQPage";
import { GalleryPage } from "./pages/GalleryPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ManageProductsPage } from "./pages/ManageProductsPage";
import { MyOrdersPage } from "./pages/MyOrdersPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { RefundPolicyPage } from "./pages/RefundPolicyPage";
import { ReturnPolicyPage } from "./pages/ReturnPolicyPage";
import { ShippingPolicyPage } from "./pages/ShippingPolicyPage";
import { ShopPage } from "./pages/ShopPage";
import { TrackOrderPage } from "./pages/TrackOrderPage";
import { WishlistPage } from "./pages/WishlistPage";

const rootRoute = createRootRoute({
  component: () => (
    <UserAuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="grain-overlay min-h-screen flex flex-col">
            <PromoBanner />
            <Navbar />
            <div className="flex-1">
              <Outlet />
            </div>
            <Footer />
          </div>
          <Toaster position="top-right" />
          <AbandonedCartReminder />
        </WishlistProvider>
      </CartProvider>
    </UserAuthProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shop",
  component: ShopPage,
});
const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shop/$id",
  component: ProductDetailPage,
});
const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: CheckoutPage,
});
const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order-confirmation",
  component: OrderConfirmationPage,
});
const customOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/custom-orders",
  component: CustomOrdersPage,
});
const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/gallery",
  component: GalleryPage,
});
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});
const manageProductsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/manage-products",
  component: ManageProductsPage,
});
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});
const wishlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wishlist",
  component: WishlistPage,
});
const trackOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/track-order",
  component: TrackOrderPage,
});
const myOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-orders",
  component: MyOrdersPage,
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});
const faqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/faq",
  component: FAQPage,
});
const returnPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/return-policy",
  component: ReturnPolicyPage,
});
const shippingPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shipping-policy",
  component: ShippingPolicyPage,
});
const refundPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/refund-policy",
  component: RefundPolicyPage,
});
const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy-policy",
  component: PrivacyPolicyPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  shopRoute,
  productRoute,
  checkoutRoute,
  orderConfirmationRoute,
  customOrdersRoute,
  galleryRoute,
  contactRoute,
  adminRoute,
  manageProductsRoute,
  aboutRoute,
  wishlistRoute,
  trackOrderRoute,
  myOrdersRoute,
  loginRoute,
  faqRoute,
  returnPolicyRoute,
  shippingPolicyRoute,
  refundPolicyRoute,
  privacyPolicyRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
