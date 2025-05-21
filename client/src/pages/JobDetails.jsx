import axios, { Axios } from 'axios'
import { useContext, useEffect, useState } from 'react'


import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css'
import { compareAsc, format } from "date-fns";

import { useNavigate, useParams } from 'react-router-dom'
import { AuthContext } from '../providers/AuthProvider';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const [startDate, setStartDate] = useState(new Date())
  console.log(startDate)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  //const { user } = useContext(AuthContext)
  const [jobs, setjobs] = useState([])
  const { id } = useParams()
  const { bayer,_id, bid_count, dedline, max_price, min_price, category,
    job_title, description, } = jobs
  console.log(startDate)
  useEffect(() => {
    fetchalljob()
  }, [id])
  const fetchalljob = async () => {
    const { data } = await axios.get(`http://localhost:5000/job/${id}`)
    setjobs(data)
    console.log(data)
    // setStartDate(new Date(data.dedline))
  }
  console.log(jobs)


  //handle form submit
  const handleFotmSubmit = async (e) => {
    e.preventDefault()
    const price = e.target.price.value
    const email = e.target.email.value
    const comment = e.target.comment.value
    const JobId =_id
    if (user.email == bayer.email) return toast.error('Action not permited')

    if (compareAsc(new Date(), new Date(dedline)) === 1) return toast.error('Dedline is over')
    if (price > max_price) return toast.error('your Prise is so hi')
    if (compareAsc(new Date(startDate), new Date(dedline)) === 1) return toast.error('Your dedline is very Over')
    const bidData = { JobId,price, email, comment, dedline:startDate,job_title ,category,bayer:bayer?.email,status:'Pending'}
    console.log(bidData)
    try {
      const { data } = await axios.post('http://localhost:5000/addbid', bidData)
      console.log(data)
      toast.success('bid added successfully')
      navigate('/my-bids')

    } catch (error) {
      toast.error(error.response.data)
      console.log(error)
    }
  }

  return (
    <div className='flex flex-col md:flex-row justify-around gap-5  items-center min-h-[calc(100vh-306px)] md:max-w-screen-xl mx-auto '>
      {/* Job Details */}
      <div className='flex-1  px-4 py-7 bg-white rounded-md shadow-md md:min-h-[350px]'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-light text-gray-800 '>


            Deadline: {dedline && format(new Date(dedline), 'P')}

          </span>
          <span className='px-4 py-1 text-xs text-blue-800 uppercase bg-blue-200 rounded-full '>
            {category}
          </span>
        </div>

        <div>
          <h1 className='mt-2 text-3xl font-semibold text-gray-800 '>
            {job_title}
          </h1>

          <p className='mt-2 text-lg text-gray-600 '>
            {description}
          </p>
          <p className='mt-6 text-sm font-bold text-gray-600 '>
            Buyer Details:
          </p>
          <div className='flex items-center gap-5'>
            <div>
              <p className='mt-2 text-sm  text-gray-600 '>
                Name: Programming-Hero Instructors
              </p>
              <p className='mt-2 text-sm  text-gray-600 '>
                Email: instructors@programming-hero.com
              </p>
            </div>
            <div className='rounded-full object-cover overflow-hidden w-14 h-14'>
              <img
                src='https://i.ibb.co.com/qsfs2TW/Ix-I18-R8-Y-400x400.jpg'
                alt=''
              />
            </div>
          </div>
          <p className='mt-6 text-lg font-bold text-gray-600 '>
            Range: ${min_price} - ${max_price}
          </p>
        </div>
      </div>
      {/* Place A Bid Form */}
      <section className='p-6 w-full  bg-white rounded-md shadow-md flex-1 md:min-h-[350px]'>
        <h2 className='text-lg font-semibold text-gray-700 capitalize '>
          Place A Bid
        </h2>

        <form onSubmit={handleFotmSubmit}>
          <div className='grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2'>
            <div>
              <label className='text-gray-700 ' htmlFor='price'>
                Price
              </label>
              <input
                id='price'
                type='text'
                name='price'
                required
                className='block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring'
              />
            </div>

            <div>
              <label className='text-gray-700 ' htmlFor='emailAddress'>
                Email Address
              </label>
              <input
                id='emailAddress'
                type='email'
                name='email'
                value={user.email}
                className='block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring'
              />
            </div>

            <div>
              <label className='text-gray-700 ' htmlFor='comment'>
                Comment
              </label>
              <input
                id='comment'
                name='comment'
                type='text'
                className='block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring'
              />
            </div>
            <div className='flex flex-col gap-2 '>
              <label className='text-gray-700'>Deadline</label>

              {/* Date Picker Input Field */}
              <DatePicker
                className='border p-2 rounded-md'
                selected={startDate}
                onChange={date => setStartDate(date)}
              />
            </div>
          </div>

          <div className='flex justify-end mt-6'>
            <button
              type='submit'
              className='px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600'
            >
              Place Bid
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default JobDetails
