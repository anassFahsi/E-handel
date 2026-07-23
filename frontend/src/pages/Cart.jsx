import { Link } from "react-router-dom"


const Cart = ({cart, removeFromCart}) => {

    const total=cart.reduce((sum,item)=>sum+item.price,0)
  return (
    <div>
        <h1>Cart</h1>
        { cart.length===0 && <p>Your cart is empty.</p>}
        <ul>
            {cart.map((item,index)=>(
            
                <li key={index}>{item.name}
                - {item.price} kr
                <button onClick={()=>removeFromCart(item.id)}>Remove</button></li>
            ))}
        </ul>
        <h2>Total: {total} kr</h2>
        <Link to={'/'}>Back to products</Link>
    </div>
  )
}

export default Cart
