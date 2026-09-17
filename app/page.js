import Link from 'next/link';
import { getProducts } from '@/lib/products';
import HeroSection from '@/components/HeroSection';

export default function Home(){
 const products=getProducts();
 const categories=[...new Set(products.map(p=>p.category))];
 return <>
  <HeroSection />
  <section className="section"><div className="wrap"><div className="section-head"><h2>Our Collections</h2><p>Browse the latest products and festive offers.</p></div><div className="category-grid">{categories.length?categories.map(c=><div className="category-card" key={c}><h3>{c}</h3><p>Discover products in this collection with actual price and special price shown clearly.</p><Link href={'/products?category='+encodeURIComponent(c)}>View items →</Link></div>):<div className="category-card"><h3>Festive Crackers</h3><p>Our product catalogue will appear here.</p></div>}</div></div></section>
  <section className="yellow-band"><div className="wrap"><h2>Special festive prices</h2><p>See actual prices and current prices together before placing your order.</p><Link className="btn btn-red" href="/products">Shop the collection</Link></div></section>
  <section className="section why"><div className="wrap why-grid"><div><h2 style={{color:'var(--red-dark)',fontSize:36}}>A simple way to order</h2><p style={{color:'var(--muted)',lineHeight:1.7}}>Choose your products, enter the quantity you need and use the Order action. Your selected product details and quantity are prepared automatically for the business contact.</p></div><div className="points"><div className="point"><h4>Clear product details</h4><p>Image, product name, content and pricing are shown in one table.</p></div><div className="point"><h4>Easy quantity selection</h4><p>Enter the quantity and see the total instantly.</p></div><div className="point"><h4>Fast order action</h4><p>Send the prepared order details directly to the business number.</p></div></div></div></section>
 </>;
}

