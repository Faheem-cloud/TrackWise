const BASE_URL = "http://localhost:5000";
let chartInstance = null;
async function loadCategories(){
    const select = document.getElementById("categorySelect");
    if(!select) return;
    const res = await fetch(`${BASE_URL}/categories`);
    const categories = await res.json();
    select.innerHTML = "<option value=''>Select Category</option>";
    categories.forEach(cat=>{
        select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });
}
async function addCategory(){
    const newCat = document.getElementById("newCategory")?.value.trim();
    if(!newCat) return;
    await fetch(`${BASE_URL}/add-category`,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ name:newCat })
    });
    document.getElementById("newCategory").value="";
    loadCategories();
}
async function addExpense(){
    const category_id = document.getElementById("categorySelect").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const expense_date = document.getElementById("date").value;
    const note = document.getElementById("note")?.value || "";
    if(!category_id || !amount || !expense_date){
        alert("Please fill all fields");
        return;
    }
    await fetch(`${BASE_URL}/add-expense`,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
            category_id,
            amount,
            expense_date,
            note
        })
    });
    document.getElementById("amount").value="";
    document.getElementById("date").value="";
    if(document.getElementById("note")){
        document.getElementById("note").value="";
    }
    loadExpenses();
    loadDashboard();
}
async function loadExpenses(){
    const table = document.getElementById("expenseTable");
    if(!table) return;
    const res = await fetch(`${BASE_URL}/expenses`);
    const expenses = await res.json();
    table.innerHTML="";
    expenses.forEach(e=>{
        table.innerHTML += `
        <tr>
            <td>${e.category}</td>
            <td>₹${e.amount}</td>
            <td>${e.expense_date}</td>
            <td>${e.note ? e.note : "-"}</td>
            <td>
                <button onclick="deleteExpense(${e.id})"
                    style="background:#ef4444;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">
                    Delete
                </button>
            </td>
        </tr>
        `;
    });
}
async function deleteExpense(id){
    await fetch(`${BASE_URL}/delete-expense/${id}`,{
        method:"DELETE"
    });

    loadExpenses();
    loadDashboard();
}
async function addIncome(){
    const amount = parseFloat(document.getElementById("incomeAmount").value);
    const income_date = document.getElementById("incomeDate").value;

    if(!amount || !income_date) return;

    await fetch(`${BASE_URL}/add-income`,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ amount, income_date })
    });

    document.getElementById("incomeAmount").value="";
    document.getElementById("incomeDate").value="";

    loadDashboard();
}
async function loadDashboard(){
    const expRes = await fetch(`${BASE_URL}/expenses`);
    const incRes = await fetch(`${BASE_URL}/income`);
    const catRes = await fetch(`${BASE_URL}/categories`);
    const expenses = await expRes.json();
    const income = await incRes.json();
    const categories = await catRes.json();
    const totalExpense = expenses.reduce((sum,e)=>sum+Number(e.amount),0);
    const totalIncome = income.reduce((sum,i)=>sum+Number(i.amount),0);
    const remaining = totalIncome - totalExpense;
    if(document.getElementById("totalExpense"))
        document.getElementById("totalExpense").innerText="₹"+totalExpense;
    if(document.getElementById("totalIncome"))
        document.getElementById("totalIncome").innerText="₹"+totalIncome;
    if(document.getElementById("remainingBalance"))
        document.getElementById("remainingBalance").innerText="₹"+remaining;
    if(document.getElementById("totalCategories"))
        document.getElementById("totalCategories").innerText=categories.length;
    const ctx = document.getElementById("expenseChart");
    if(!ctx) return;
    if(chartInstance){
        chartInstance.destroy();
    }
    let categoryTotals = {};
    expenses.forEach(e=>{
        if(!categoryTotals[e.category]){
            categoryTotals[e.category]=0;
        }
        categoryTotals[e.category]+=Number(e.amount);
    });
    let labels = Object.keys(categoryTotals);
    let data = Object.values(categoryTotals);
    chartInstance = new Chart(ctx,{
        type:"doughnut",
        data:{
            labels:labels,
            datasets:[{
                data:data,
                backgroundColor:[
                    "#8b5cf6",
                    "#3b82f6",
                    "#f59e0b",
                    "#ef4444",
                    "#14b8a6",
                    "#6366f1",
                    "#e11d48",
                    "#0ea5e9"
                ],
                borderWidth:0
            }]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false,
            cutout:"75%",
            plugins:{
                legend:{
                    position:"bottom"
                }
            }
        }
    });
}
if(document.getElementById("categorySelect")) loadCategories();
if(document.getElementById("expenseTable")) loadExpenses();
if(document.getElementById("expenseChart")) loadDashboard();