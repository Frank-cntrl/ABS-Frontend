import React, { useState, useEffect } from "react";

const UserPage = ( {user} ) =>{

if (!user) {
    return (
        <div className = "body">
            <div className = "heading">
                <h1>My Profile</h1>
            </div>
            <p>Please Log in to view your profile</p>
        </div>
    )
};

return (
<div className="body">
    <div className="heading">
    <h1>
        My Profile
    </h1>
    </div>
    <div className="user-info">
    <p>
        my name is {user.username}
    </p>
    </div>
</div>
    
);

};

export default UserPage;