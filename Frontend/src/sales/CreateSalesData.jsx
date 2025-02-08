import React, { useState } from 'react';

const CreateSalesData = () => {
    // State to manage visibility of the dropdown and selected items
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    // Options for the dropdown (checkbox items)
    const options = [
        { value: 'Item 1', label: 'Item 1' },
        { value: 'Item 2', label: 'Item 2' },
        { value: 'Item 3', label: 'Item 3' },
        { value: 'Item 4', label: 'Item 4' }
    ];

    // Toggle dropdown visibility
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // Handle checkbox selection and update the selected items
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedItems((prevSelected) => [...prevSelected, value]);
        } else {
            setSelectedItems((prevSelected) => prevSelected.filter(item => item !== value));
        }
    };

    return (
        <div>
            {/* Dropdown Button */}
            <div className="dropdown" >
                <button onClick={toggleDropdown} >
                    Select Items
                </button>
                {isOpen && (
                    <div className="dropdown-content" >
                        {/* Loop through options and create checkboxes */}
                        {options.map((option) => (
                            <label key={option.value} >
                                <input
                                    type="checkbox"
                                    value={option.value}
                                    checked={selectedItems.includes(option.value)}
                                    onChange={handleCheckboxChange}
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Display selected items */}
            <div >
                <h3>Selected Items:</h3>
                <p>{selectedItems.join(', ') || 'None'}</p>
            </div>
        </div>
    );
};

// Styles for the dropdown (inline for simplicity)


export default CreateSalesData;
