function switchToMonsters() {
    window.location.href = 'monsters.html';
}  

function switchToFight() {
  window.location.href = 'fight.html';
}  

// Function to handle item selection
  function selectItem(event) {
    const items = event.currentTarget.querySelectorAll('li');
    items.forEach(item => item.classList.remove('selected'));
    event.target.classList.add('selected');
    updatePreview();
  }

  // Attach event listeners to columns
  document.getElementById('column1').addEventListener('click', selectItem);
  document.getElementById('column2').addEventListener('click', selectItem);

  // Function to update the preview
  function updatePreview() {
    const selectedItem1 = document.querySelector('#column1 li.selected');
    const selectedItem2 = document.querySelector('#column2 li.selected');
    const preview = document.getElementById('preview');

    if (selectedItem1 && selectedItem2) {
      preview.textContent = `Preview: ${selectedItem1.textContent} + ${selectedItem2.textContent}`;
    } else {
      preview.textContent = 'Select items to combine...';
    }
  }


  
  function combineItems() {
    const selectedItem1 = document.querySelector('#column1 li.selected');
    const selectedItem2 = document.querySelector('#column2 li.selected');
    
    if (selectedItem1 && selectedItem2) {
        const input1 = selectedItem1.textContent;
        const input2 = selectedItem2.textContent;

        fetch('https://localhost:5000/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input1: input1, input2: input2 })
        })
        .then(response => response.json())
        .then(data => {
            const combinedItem = data.result;
            
            // Add to both columns
            const column1 = document.querySelector('#column1 ul');
            const column2 = document.querySelector('#column2 ul');
            
            [column1, column2].forEach(col => {
                const li = document.createElement('li');
                li.textContent = combinedItem;
                col.appendChild(li);
            });

            // Save the updated lists to localStorage
            saveItemsToLocalStorage();

            // Clear selection
            selectedItem1.classList.remove('selected');
            selectedItem2.classList.remove('selected');
            document.getElementById('preview').textContent = 'Select items to combine...';
        })
        .catch(error => console.error('Error:', error));
    } else {
        alert('Please select one item from each column.');
    }
}

function saveItemsToLocalStorage() {
  const columnItems = Array.from(document.querySelectorAll('#column1 li')).map(li => li.textContent);

  localStorage.setItem('columnItems', JSON.stringify(columnItems));
}

// Function to load items from localStorage
function loadItemsFromLocalStorage() {
  const column1 = document.querySelector('#column1 ul');
  const column2 = document.querySelector('#column2 ul');

  // Retrieve items from localStorage (using 'columnItems')
  const columnItems = JSON.parse(localStorage.getItem('columnItems')) || [];

  // Clear existing items in both columns
  column1.innerHTML = '';
  column2.innerHTML = '';

  // Populate both columns with the same items
  columnItems.forEach(item => {
    const li1 = document.createElement('li');
    li1.textContent = item;
    column1.appendChild(li1);

    const li2 = document.createElement('li');
    li2.textContent = item;
    column2.appendChild(li2);
  });
}

function resetColumns() {
  const defaultItems = ["Water", "Fire", "Metal", "Wood", "Earth"];

  // Clear both columns
  const column1 = document.querySelector('#column1 ul');
  const column2 = document.querySelector('#column2 ul');
  column1.innerHTML = '';
  column2.innerHTML = '';

  // Populate both columns with default items
  defaultItems.forEach(item => {
    const li1 = document.createElement('li');
    li1.textContent = item;
    column1.appendChild(li1);

    const li2 = document.createElement('li');
    li2.textContent = item;
    column2.appendChild(li2);
  });

  // Save the default state to localStorage
  saveItemsToLocalStorage();
}

// Load items when the page loads
document.addEventListener('DOMContentLoaded', loadItemsFromLocalStorage);
