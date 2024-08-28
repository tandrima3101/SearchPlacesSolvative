import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'

function SearchPlaces() {
  const [searchTerm, setSearchTerm] = useState(null);
  const [places, setPlaces] = useState([])
  const [filterdPlaces, setFilteredPlaces] = useState([])
  const [pages, setPages] = useState(5)
  const [curentPage, setCurrentPage] = useState(0)
  const [totalPage, setTotalPage] = useState(0)
  const [totalPlaces, setTotalPlaces] = useState(0)
  const searchInputRef = useRef(null);
  const [loader, setLoader] = useState(false)

  // Handle input change
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value)
  };


  useEffect(() => {
    if (searchTerm != '') {
      // Filter places based on search input
      setFilteredPlaces(places && places?.length > 0 && places?.filter(place =>
        place?.name && place?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    }
  }, [searchTerm])

  // Handle keydown event to focus on search input
  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === '/') {
      event.preventDefault(); // Prevent default browser behavior
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  };

  useEffect(() => {
    // Add event listener when component mounts
    window.addEventListener('keydown', handleKeyDown);

    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  //API call
  const getPlaces = async () => {
    const options = {
      method: 'GET',
      url: `${process.env.REACT_APP_RAPIDAPI_URL}?limit=${pages}&offset=${curentPage}`,
      headers: {
        'x-rapidapi-key': `${process.env.REACT_APP_RAPIDAPI_KEY}`,
        'x-rapidapi-host': `${process.env.REACT_APP_RAPIDAPI_HOST}`
      }
    };
    try {
      setLoader(true)
      const response = await axios.request(options);
      setLoader(false)
      console.log(response, 'RESPONSE')
      setPlaces(response?.data?.data);
      setTotalPlaces(response?.data);
    } catch (error) {
      console.error(error);
    }
  }
  console.log(loader, 'LOADER')
  useEffect(() => {
    if (pages) {
      getPlaces()
    }
  }, [pages, curentPage])

  //setPagination
  useEffect(() => {
    setTotalPage(totalPlaces?.metadata?.totalCount / pages)
  })
  useEffect(() => {
    if (filterdPlaces.length > 0) {
      setPlaces(filterdPlaces)
    }
  }, [filterdPlaces])

  console.log(filterdPlaces, 'FILTER')
  return (
    <div className='container'>
      <div className="search-container">
        <input value={searchTerm}
          onChange={handleSearchChange}
          ref={searchInputRef}
          type="text" id="search" placeholder="Search Places" aria-label="Search for places" />
        <div className='shortCut'>
          Ctrl + /
        </div>
      </div>
      <table className="results-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Place Name</th>
            <th>Country</th>
          </tr>
        </thead>
        <tbody>
          {
            loader ? <p>Loading.........</p> : 
            places?.length == 0 ? <p>No data found</p> : 
            places?.map((x, index) => {
              return (
                <tr>
                  <td>{index + 1}</td>
                  <td>{x.name}</td>
                  <td className='countrySlot'>
                    <img src={`https://flagsapi.com/${x.countryCode}/flat/32.png`} />
                    {x.country}
                  </td>
                </tr>
              )
            })
          }

        </tbody>
      </table>
      <div className="pagination-container">
        <div className="pagination">
          <button disabled={curentPage == 0} type="button" onClick={() => setCurrentPage(curentPage - 1)}>Previous</button>
          <span>Page {curentPage + 1} of {totalPage && totalPage}</span>
          <button type="button" onClick={() => setCurrentPage(curentPage + 1)}>Next</button>
        </div>
        <div className="results-limit">
          <label htmlFor="results-count">Places per page:</label>
          <input type='number' onChange={(e) => { setPages(e.target.value); setCurrentPage(0) }} value={pages} id="results-count" min="1" max="10" />
          {
            pages > 10 && <p className='erroeMessage'>Places should be less than 10</p>
          }
        </div>
      </div>
    </div>
  )
}

export default SearchPlaces