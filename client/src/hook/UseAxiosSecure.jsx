import axios from "axios"
import { useContext, useEffect } from "react"
import { AuthContext } from "../providers/AuthProvider"

const AxiosSecure = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true

})
const useAxiosSecure = () => {
    const { logOut } = useContext(AuthContext)
    useEffect(() => {
        AxiosSecure.interceptors.response.use(res => {
            return res
        }, async error => {
            if (error.response.status == 401 || error.response.status == 403) {
                await logOut()
            }
           // return Promise.reject(error)
        }
        )

    }, [logOut])
    return AxiosSecure
}
export default useAxiosSecure