import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Products = () => {
    const [products, setProducts]=useState([])
    const [search,setSearch]=useState('');
    const [categories,setCategories]=useState([]);
    const[category,setCategory]=useState('');
    const [sort,setSort]=useState('newest');
    const [page,setPage]=useState(1);
    const [limit,setLimit]=useState(5);
    const [totalProducts,setTotalProducts]=useState(0);
    const totalPages=Math.ceil(totalProducts/limit);
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, totalProducts);
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
   
    const fetchProducts=async()=>{
        
        const res=await axios.get('http://localhost:3000/products',{params:{search,category,sort,limit,page}});
        setProducts(res.data.products.map(p=>({...p,price:Number(p.price)})))
        setTotalProducts(Number(res.data.productsCount));
        console.log(res.data.productsCount);
     
    }

    const fetchCategories=async()=>{
      
      try{
        const res=await axios.get('http://localhost:3000/categories');
      setCategories(res.data)
      }
      catch(error){
        console.error('Could not fetch categories',error)
      }
    }

    useEffect(()=>{
     fetchCategories();
    },[])

    useEffect(()=>{
      fetchProducts();
    },[search,category,sort,page,limit]);

    useEffect(() => {
     setPage(1);
    }, [search, category, sort, limit]);


  return (
    <div>
        <h1>Products</h1>
        <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        />

        <select 
          name='category'
          value={category}
          onChange={(e)=>setCategory(e.target.value)}
        >
          <option value=''>Alla kategorier</option>
          {categories.map((c)=>(
            <option key={c.id} value={c.id}>{c.name}</option>)
          )}
        </select>
       <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Nyast först</option>
          <option value="oldest">Äldst först</option>
          <option value="price_asc">Pris: Lågt → Högt</option>
          <option value="price_desc">Pris: Högt → Lågt</option>
      </select>

      
      <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          <option value="5">5 per sida</option>
          <option value="10">10 per sida</option>
          <option value="15">15 per sida</option>
          <option value="20">20 per sida</option>
      </select>
      

        <ul>
            {products.map((p)=>(
               <li key={p.id}>
                <Link to={`/products/${p.id}`}>
                   <strong>{p.name}</strong> - {p.price} kr
                   <img src={p.image_url.startsWith('http')?p.image_url:'http://localhost:3000'+p.image_url}
                      alt={p.name}
                      width='200'/>
               </Link>
              </li>

                ))}
        </ul>

        

<div>
  <button 
    disabled={page <= 1}
    onClick={() => setPage(page - 1)}
  >
    Previous
  </button>

  {pages.map(num => (
    <button
      key={num}
      onClick={() => setPage(num)}
      disabled={num === page}
      style={{
        margin: "0 5px",
        fontWeight: num === page ? "bold" : "normal"
        }}
      >
        {num}
       </button>
       ))}

       <button 
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
          Next
       </button>
     </div>

        <p>Page:{page} of {totalPages}</p>
        <p>
           Showing {start}-{end} of {totalProducts} products
        </p>


      
    </div>
  )
}

export default Products
