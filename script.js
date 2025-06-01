let data = JSON.parse(localStorage.getItem("groceryData")) || [];
    let editIndex = -1;

    function addEntry() {
      const date = document.getElementById("date").value;
      const item = document.getElementById("item").value;
      const price = parseFloat(document.getElementById("price").value);
      const buyer = document.getElementById("buyer").value;

      if (!date || !item || isNaN(price) || !buyer) {
        alert("Please fill all fields.");
        return;
      }

      const entry = { date, item, price, buyer };

      if (editIndex >= 0) {
        data[editIndex] = entry;
        editIndex = -1;
        document.getElementById("add-btn").textContent = "Add Entry";
      } else {
        data.push(entry);
      }

      localStorage.setItem("groceryData", JSON.stringify(data));
      clearForm();
      loadData();
    }

    function clearForm() {
      document.getElementById("date").value = "";
      document.getElementById("item").value = "";
      document.getElementById("price").value = "";
      document.getElementById("buyer").value = "";
    }

    function editEntry(index) {
      const entry = data[index];
      document.getElementById("date").value = entry.date;
      document.getElementById("item").value = entry.item;
      document.getElementById("price").value = entry.price;
      document.getElementById("buyer").value = entry.buyer;
      editIndex = index;
      document.getElementById("add-btn").textContent = "Update Entry";
    }

    function deleteEntry(index) {
      if (confirm("Are you sure you want to delete this entry?")) {
        data.splice(index, 1);
        localStorage.setItem("groceryData", JSON.stringify(data));
        loadData();
      }
    }

    function loadData() {
      const tbody = document.getElementById("table-body");
      tbody.innerHTML = "";

      let total = 0;
      const buyerTotals = {};

      data.forEach((entry, index) => {
        total += entry.price;

        const normalizedBuyer = entry.buyer.trim().toLowerCase();
        if (buyerTotals[normalizedBuyer]) {
          buyerTotals[normalizedBuyer].amount += entry.price;
        } else {
          buyerTotals[normalizedBuyer] = {
            originalName: entry.buyer.trim(),
            amount: entry.price
          };
        }

        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${entry.date}</td>
          <td>${entry.item}</td>
          <td>₹${entry.price.toFixed(2)}</td>
          <td>${entry.buyer}</td>
          <td>
            <button class="btn" onclick="editEntry(${index})">Edit</button>
            <button class="btn delete" onclick="deleteEntry(${index})">Delete</button>
          </td>
        `;

        tbody.appendChild(row);
      });

      document.getElementById("total").textContent = `Total: ₹${total.toFixed(2)}`;
      showBuyerSummary(buyerTotals, total);
    }

    function showBuyerSummary(buyerTotals, total) {
      const buyers = Object.keys(buyerTotals);
      if (buyers.length === 0) {
        document.getElementById("summary").innerHTML = "<em>No entries yet.</em>";
        return;
      }

      const eachShare = total / buyers.length;
      let html = `<p><strong>Each person should pay:</strong> ₹${eachShare.toFixed(2)}</p><ul>`;

      buyers.forEach(buyerKey => {
        const buyer = buyerTotals[buyerKey];
        const paid = buyer.amount;
        const diff = paid - eachShare;

        if (diff > 0) {
          html += `<li><strong>${buyer.originalName}</strong> paid ₹${paid.toFixed(2)}, which is ₹${diff.toFixed(2)} more than their share. They should receive back the excess.</li>`;
        } else if (diff < 0) {
          html += `<li><strong>${buyer.originalName}</strong> paid ₹${paid.toFixed(2)}, which is ₹${(-diff).toFixed(2)} less than their share. They owe more.</li>`;
        } else {
          html += `<li><strong>${buyer.originalName}</strong> paid exactly their share (₹${paid.toFixed(2)}).</li>`;
        }
      });

      html += "</ul>";
      document.getElementById("summary").innerHTML = html;
    }

    function downloadFullCSV() {
      if (data.length === 0) {
        alert("No data to export!");
        return;
      }

      const buyerTotals = {};
      let total = 0;

      data.forEach(entry => {
        total += entry.price;
        const normalizedBuyer = entry.buyer.trim().toLowerCase();
        if (buyerTotals[normalizedBuyer]) {
          buyerTotals[normalizedBuyer].amount += entry.price;
        } else {
          buyerTotals[normalizedBuyer] = {
            originalName: entry.buyer.trim(),
            amount: entry.price
          };
        }
      });

      const buyers = Object.keys(buyerTotals);
      const eachShare = total / buyers.length;

      let csvContent = "Date,Category,Price,Buyer\n";
      data.forEach(entry => {
        csvContent += `${entry.date},${entry.item},${entry.price},${entry.buyer}\n`;
      });

      csvContent += "\nBuyer,Paid,Should Have Paid,Difference\n";
      buyers.forEach(buyerKey => {
        const buyer = buyerTotals[buyerKey];
        const paid = buyer.amount;
        const diff = paid - eachShare;
        csvContent += `${buyer.originalName},${paid.toFixed(2)},${eachShare.toFixed(2)},${diff.toFixed(2)}\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "grocery_data_and_summary.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    function resetData() {
      if (confirm("Are you sure you want to delete all data? This action cannot be undone.")) {
        data = [];
        localStorage.removeItem("groceryData");
        loadData();
      }
    }

    // Initial load
    loadData();