import { Link } from "react-router-dom"


const Header = ({cartCount}) => {
  return (
    <header>
      <nav>
        <Link to='/'>Products</Link>
              {' | '} 
        <Link to ='/cart'>Cart ({cartCount})</Link>
      </nav>
    </header>
  )
}

export default Header
