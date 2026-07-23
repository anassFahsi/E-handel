import { useState } from "react"


const Checkout = ({total,cart}) => {
    const [form,setForm]=useState({
        name:'',
        email:'',
        address:''
    });

    const handleChange=(e)=>{
        const {name,value}=e.target;
        setForm(prev=>({...prev,[name]:value}))
    };

    const handleSubmit=(e)=>{
        e.preventDefault();
        console.log('Order submitted:')
        console.log('Customer:',form)
        console.log('Cart:',cart)
        console.log('Total:',total)
    }

  return (
    <div>
        <h1>Checkout</h1>
        <h2>Total: {total} kr</h2>
        <form onSubmit={handleSubmit}>
            <label>
                Name:
                <input
                    type='text'
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    >
                </input>
            </label>

             <label>
                Email:
                <input
                    type='email'
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    >
                </input>
            </label>

             <label>
                Address:
                <input
                    type='text'
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    >
                </input>
            </label>
            <button type="submit">Confirm order</button>
        </form>
      
    </div>
  )
}

export default Checkout
