import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

const Products = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // URL-driven state
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [sort, setSort] = useState(params.get("sort") || "newest");
  const [page, setPage] = useState(Number(params.get("page")) || 1);
  const [limit, setLimit] = useState(Number(params.get("limit")) || 5);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  const totalPages = Math.ceil(totalProducts / limit);

  const updateURL = (
    newPage = page,
    newCategory = category,
    newSearch = search,
    newSort = sort,
    newLimit = limit
  ) => {
    navigate(
      `/products?page=${newPage}&category=${newCategory}&search=${newSearch}&sort=${newSort}&limit=${newLimit}`
    );
  };

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:3000/products", {
      params: { search, category, sort, limit, page },
    });

    setProducts(res.data.products.map((p) => ({ ...p, price: Number(p.price) })));
    setTotalProducts(Number(res.data.productsCount));
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:3000/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Could not fetch categories", error);
    }
  };

  const setPosition=() => {
    localStorage.setItem("scrollPosition", window.scrollY);
    
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, category, sort, page, limit]);



 
  const renderFilters = () => (
    <>
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
          updateURL(1, category, e.target.value, sort, limit);
        }}
      />

      <select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setPage(1);
          updateURL(1, e.target.value, search, sort, limit);
        }}
      >
        <option value="">Alla kategorier</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      
      <select
        value={sort}
        onChange={(e) => {
          setSort(e.target.value);
          setPage(1);
          updateURL(1, category, search, e.target.value, limit);
        }}
      >
        <option value="newest">Nyast först</option>
        <option value="oldest">Äldst först</option>
        <option value="price_asc">Pris: Lågt → Högt</option>
        <option value="price_desc">Pris: Högt → Lågt</option>
      </select>

    
      <select
        value={limit}
        onChange={(e) => {
          const newLimit = Number(e.target.value);
          setLimit(newLimit);
          setPage(1);
          updateURL(1, category, search, sort, newLimit);
        }}
      >
        <option value="5">5 per sida</option>
        <option value="10">10 per sida</option>
        <option value="15">15 per sida</option>
        <option value="20">20 per sida</option>
      </select>
    </>
  );

  return (
    <div>
      <h1>Products</h1>

      {renderFilters()}

      {totalProducts === 0 && (
        <>
          <p style={{ marginTop: "20px" }}>Ingen produkt hittad</p>

          <button
            onClick={() => {
              setSearch("");
              setCategory("");
              setSort("newest");
              setLimit(5);
              setPage(1);
              updateURL(1, "", "", "newest", 5);
            }}
          >
            Rensa filter
          </button>
        </>
      )}

    
      {totalProducts > 0 && (
        <>
          <ul>
            {products.map((p) => (
              <li key={p.id}>
                  <Link
                    to={`/products/${p.id}`}
                  >
                  <strong>{p.name}</strong> - {p.price} kr
                  <img
                    src={
                      p.image_url.startsWith("http")
                            ? p.image_url
                         : "http://localhost:3000" + p.image_url
                          }
                        alt={p.name}
                             width="200"
                           />
                </Link>

              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div>
            <button
              disabled={page <= 1}
              onClick={() => {
                setPage(page - 1);
                updateURL(page - 1);
              }}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => {
                  setPage(num);
                  updateURL(num);
                }}
                disabled={num === page}
              >
                {num}
              </button>
            ))}

            <button
              disabled={page >= totalPages}
              onClick={() => {
                setPage(page + 1);
                updateURL(page + 1);
              }}
            >
              Next
            </button>
          </div>

          <p>Page: {page} of {totalPages}</p>
          <p>
            Showing {(page - 1) * limit + 1} - {Math.min(page * limit, totalProducts)} of{" "}
            {totalProducts} products
          </p>
        </>
      )}
    </div>
  );
};

export default Products;


