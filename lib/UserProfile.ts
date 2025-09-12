import { useState, useEffect } from "react";
import axios from "axios";

interface UserDetails {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    // Add more fields based on your API response
}

interface UseUserDetailsResult {
    data: UserDetails | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useUserDetails = (): UseUserDetailsResult => {

    const [data, setData] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/get_user_details/`, {
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json"
                },
            });
            setData(response.data);
        } catch (err: any) {
            console.error("Error fetching user details:", err);
            setError(err.response?.data?.detail || err.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
};
