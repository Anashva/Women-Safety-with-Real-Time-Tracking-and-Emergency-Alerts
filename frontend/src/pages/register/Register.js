import React from 'react'
import { useState } from 'react'




const Register = () => {
  const [contacts,setContacts]=useState([{name:"",phone:""}]);

  // add newly empty contact field
  const addContact=()=>{
    setContacts([... contacts,{name:"",phone:""}]);
  };


  // handle input change for contacts
  const handleContactChange=(index,field,value)=>{
    const updatedContacts=[...contacts];
    updatedContacts[index][field]=value;
    setContacts(updatedContacts);
  }




  // remove contact
  const removeContact=(index)=>{
    const updatedContacts=contacts.filter((_, i)=> i !== index);
    setContacts(updatedContacts);
  }



  return (
 <div className="container mt-5">
      <h2 className="text-center mb-4">Register</h2>
      <form className="mx-auto" style={{ maxWidth: "600px" }}>
        {/* Full Name */}
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter your full name" required/>
        </div>

        {/* Phone Number */}
        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            className="form-control"
            placeholder="Enter your phone number" required/>
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label">Email address</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email" required/>
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password" required/>
        </div>

        {/* Emergency Contacts */}
        <div className="mb-3">
          <label className="form-label">Emergency Contacts</label>
          {contacts.map((contact, index) => (
            <div key={index} className="d-flex mb-2">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Name"
                value={contact.name}
                onChange={(e) =>
                  handleContactChange(index, "name", e.target.value)
                }
              />
              <input
                type="text"
                className="form-control me-2"
                placeholder="Phone/Email"
                value={contact.phone}
                onChange={(e) =>
                  handleContactChange(index, "phone", e.target.value)
                }
              />
              {contacts.length > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => removeContact(index)}
                >
                  ✖
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-primary mt-2"
            onClick={addContact}
          >
            + Add Contact
          </button>
          
        </div>

        <button type="submit" className="btn btn-danger w-100">
          Register
        </button>
      </form>
    </div>
  )
}

export default Register