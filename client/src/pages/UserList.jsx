import { useQuery } from "@apollo/client";
import { useState } from "react";
import { GET_USERS } from "../utils/queries"; // Adjust the import path as necessary

function UserList() {
    const { loading, error, data } = useQuery(GET_USERS);
    const [filterValue, setFilterValue] = useState("");

    if (loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>;
    if (error) return <p style={{ color: "red", textAlign: "center", marginTop: "2rem" }}>Error: {error.message}</p>;

    // Filter users only if there's input
    const filteredUsers = filterValue
        ? data?.users?.filter((user) =>
                user.username.toLowerCase().includes(filterValue.toLowerCase())
            ) || []
        : [];

    const handleFilterChange = (e) => {
        setFilterValue(e.target.value);
    };

    return (
        <div
            style={{
                maxWidth: "400px",
                margin: "2rem auto",
                padding: "2rem",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
        >
           
            <input
                type="text"
                placeholder="Search users..."
                value={filterValue}
                onChange={handleFilterChange}
                style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    marginBottom: "1.5rem",
                    fontSize: "1rem",
                    outline: "none",
                    boxSizing: "border-box",
                }}
            />

            <div>
                {filterValue ? (
                    filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                style={{
                                    padding: "0.75rem 1rem",
                                    marginBottom: "0.75rem",
                                    borderRadius: "8px",
                                    background: "#f7f7f9",
                                    border: "1px solid #ececec",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <span style={{ fontWeight: "bold", color: "#222" }}>{user.username}</span>
                                <span style={{ color: "#666", fontSize: "0.95em" }}>{user.email}</span>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: "#888", textAlign: "center" }}>No users found</p>
                    )
                ) : (
                    <p style={{ color: "#aaa", textAlign: "center" }}>Type to search users</p>
                )}
            </div>
        </div>
    );
}

export default UserList;
