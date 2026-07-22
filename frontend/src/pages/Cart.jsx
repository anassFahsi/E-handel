import { Link } from "react-router-dom"


const Cart = ({cart}) => {
  return (
    <div>
        <h1>Cart</h1>
        { cart.length===0 && <p>Your cart is empty.</p>}
        <ul>
            {cart.map((item,index)=>(
            
                <li key={index}>{item.name}
                - {item.price} kr</li>
            ))}
        </ul>
        <Link to={'/'}>Back to products</Link>
    </div>
  )
}

export default Cart
