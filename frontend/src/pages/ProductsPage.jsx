import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";

const Products = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const {convert, currency}=useCurrency();
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [sort, setSort] = useState(params.get("sort") || "oldest");
  const [page, setPage] = useState(Number(params.get("page")) || 1);
  const [limit, setLimit] = useState(Number(params.get("limit")) || 10);

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
    const res = await axios.get("/api/search", {
      params: { q:search, page, pageSize: limit, category, sort},
    });
    
       setProducts(res.data.data.map((p) => (
    {...p, price: Number(p.price),}))
  );

    setTotalProducts(
      Number(res.data.meta.total)
    );
        setTotalProducts(Number(res.data.meta.total));
};

const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Could not fetch categories", error);
    }
  };



  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, category, sort, page, limit]);

 

  return (
    <div className="products-page">

  <div className="products-filters">
    <input
      className="filter-input"
      type="text"
      placeholder="Sök produkter..."
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        setPage(1);
        updateURL(1, category, e.target.value, sort, limit);
      }}
    />

    <select
      className="filter-select"
      value={category}
      onChange={(e) => {
        setCategory(e.target.value);
        setPage(1);
        updateURL(1, e.target.value, search, sort, limit);
      }}
    >
      <option value="">Alla kategorier</option>
      {categories.map((c) => (
        <option key={c.id} value={c.name}>
          {c.name}
        </option>
      ))}
    </select>

    <select
      className="filter-select"
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
      className="filter-select"
      value={limit}
      onChange={(e) => {
        const newLimit = Number(e.target.value);
        setLimit(newLimit);
        setPage(1);
        updateURL(1, category, search, sort, newLimit);
      }}
    >
      <option value="10">10 per sida</option>
      <option value="15">15 per sida</option>
      <option value="20">20 per sida</option>
    </select>
  </div>

  {totalProducts === 0 && (
    <div className="no-products">
      <p className="no-products-text">Ingen produkt hittad</p>

      <button
        className="btn btn-secondary"
        onClick={() => {
          setSearch("");
          setCategory("");
          setSort("newest");
          setLimit(10);
          setPage(1);
          updateURL(1, "", "", "newest", 10);
        }}
      >
        Rensa filter
      </button>
    </div>
  )}

  {totalProducts > 0 && (
    <div className="products-list">
      <ul className="product-grid">
        {products.map((p) => (
          <li key={p.id} className="product-card">
            <Link to={`/products/${p.id}`} className="product-link">
              <img
            className="product-image"
                src={p.imageUrl}
                alt={p.name}
              />
              <strong className="product-name">{p.name}</strong>
              <span className="product-price">{convert(p.price).toFixed(2)} {currency}</span>

              
            
            </Link>
          </li>
        ))}
      </ul>

      <div className="pagination">
        <button
          className="btn btn-secondary"
          disabled={page <= 1}
          onClick={() => {
            setPage(page - 1);
            updateURL(page - 1);
          }}
        >
          Föregående
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            className={`btn pagination-btn ${num === page ? "active" : ""}`}
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
          className="btn btn-secondary"
          disabled={page >= totalPages}
          onClick={() => {
            setPage(page + 1);
            updateURL(page + 1);
          }}
        >
          Nästa
        </button>
      </div>

      <p className="pagination-info">
        Sida {page} av {totalPages}
      </p>

      <p className="pagination-info">
        Visar {(page - 1) * limit + 1} - {Math.min(page * limit, totalProducts)} av{" "}
        {totalProducts} produkter
      </p>
    </div>
  )}
</div>

  );
};

export default Products;




