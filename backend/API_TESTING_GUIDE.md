# API Testing Guide

This guide provides step-by-step instructions to test the Wedding Expense Tracker API.

## Prerequisites

1. Make sure the server is running on `http://localhost:5000`
2. MongoDB is running
3. Use Postman, curl, or any API client

## Testing Workflow

### Step 1: Register Admin User

**Endpoint:** `POST /api/auth/register`

```json
{
  "mobile": "9876543210",
  "pin": "1234",
  "role": "admin"
}
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "652abc123def456...",
    "mobile": "9876543210",
    "role": "admin"
  }
}
```

**Save the token** for subsequent requests!

---

### Step 2: Register Regular Users

**Endpoint:** `POST /api/auth/register`

User 1:
```json
{
  "mobile": "9876543211",
  "pin": "5678"
}
```

User 2:
```json
{
  "mobile": "9876543212",
  "pin": "9012"
}
```

---

### Step 3: Login as Admin

**Endpoint:** `POST /api/auth/login`

```json
{
  "mobile": "9876543210",
  "pin": "1234"
}
```

---

### Step 4: Create Budget

**Endpoint:** `POST /api/budget`
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

```json
{
  "totalBudget": 1000000
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Budget created successfully",
  "budget": {
    "_id": "...",
    "totalBudget": 1000000,
    "amountSpent": 0,
    "remaining": 1000000
  }
}
```

---

### Step 5: Create Tasks/Categories

**Endpoint:** `POST /api/tasks`
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

Task 1 - Venue:
```json
{
  "name": "Venue",
  "estimatedCost": 200000,
  "description": "Wedding venue and decorations"
}
```

Task 2 - Catering:
```json
{
  "name": "Catering",
  "estimatedCost": 300000,
  "description": "Food and beverages for 500 guests"
}
```

Task 3 - Photography:
```json
{
  "name": "Photography",
  "estimatedCost": 150000,
  "description": "Professional photography and videography"
}
```

Task 4 - Outfits:
```json
{
  "name": "Outfits",
  "estimatedCost": 200000,
  "description": "Bride and groom outfits"
}
```

Task 5 - Decor:
```json
{
  "name": "Decor",
  "estimatedCost": 150000,
  "description": "Venue decoration and lighting"
}
```

**Save the task IDs** for expense submission!

---

### Step 6: Get All Tasks

**Endpoint:** `GET /api/tasks`
**Headers:** `Authorization: Bearer <TOKEN>`

This will show all tasks with their estimated costs and current actual costs.

---

### Step 7: Submit Expenses as Users

**Login as User 1** (mobile: 9876543211)

**Endpoint:** `POST /api/expenses`
**Headers:** `Authorization: Bearer <USER1_TOKEN>`

Expense 1:
```json
{
  "task": "<VENUE_TASK_ID>",
  "description": "Advance payment for venue booking",
  "amount": 50000,
  "date": "2025-10-01"
}
```

Expense 2:
```json
{
  "task": "<CATERING_TASK_ID>",
  "description": "Advance for catering",
  "amount": 100000,
  "date": "2025-10-02"
}
```

**Login as User 2** (mobile: 9876543212)

Expense 3:
```json
{
  "task": "<PHOTOGRAPHY_TASK_ID>",
  "description": "Photographer booking fee",
  "amount": 75000,
  "date": "2025-10-03"
}
```

---

### Step 8: Admin Creates Auto-Approved Expense

**Endpoint:** `POST /api/expenses`
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

```json
{
  "task": "<OUTFITS_TASK_ID>",
  "description": "Bride's wedding dress",
  "amount": 80000,
  "date": "2025-10-04"
}
```

This expense will be auto-approved since admin created it!

---

### Step 9: View Pending Expenses (Admin)

**Endpoint:** `GET /api/expenses?status=pending`
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

You should see the 3 expenses submitted by users.

---

### Step 10: Approve Expenses

**Endpoint:** `PUT /api/expenses/<EXPENSE_ID>/status`
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

Approve Expense 1:
```json
{
  "status": "approved"
}
```

Approve Expense 2:
```json
{
  "status": "approved"
}
```

Reject Expense 3:
```json
{
  "status": "rejected"
}
```

---

### Step 11: Check Budget After Approvals

**Endpoint:** `GET /api/budget/summary`
**Headers:** `Authorization: Bearer <TOKEN>`

**Expected Response:**
```json
{
  "success": true,
  "summary": {
    "totalBudget": 1000000,
    "amountSpent": 230000,
    "remaining": 770000,
    "percentageUsed": "23.00"
  }
}
```

---

### Step 12: View Admin Dashboard

**Endpoint:** `GET /api/dashboard/admin`
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

This provides:
- Budget summary
- Task summaries with over/under budget indicators
- Expense statistics
- Recent activities
- Alerts for over-budget tasks

---

### Step 13: View User Dashboard

**Login as User 1**

**Endpoint:** `GET /api/dashboard/user`
**Headers:** `Authorization: Bearer <USER1_TOKEN>`

This shows:
- Personal expense statistics
- Budget overview
- Recent expense submissions

---

### Step 14: Get Expense Breakdown

**Endpoint:** `GET /api/dashboard/expense-breakdown`
**Headers:** `Authorization: Bearer <TOKEN>`

Shows expense distribution across tasks.

---

### Step 15: Add More Expenses and Test Over-Budget

**Endpoint:** `POST /api/expenses`
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

Add a large expense to Venue:
```json
{
  "task": "<VENUE_TASK_ID>",
  "description": "Final payment for venue",
  "amount": 180000,
  "date": "2025-10-10"
}
```

Now check tasks:

**Endpoint:** `GET /api/tasks`

The Venue task should show:
- Estimated: 200,000
- Actual: 230,000
- Status: 🔴 over-budget

---

### Step 16: Update Budget

**Endpoint:** `POST /api/budget`
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

```json
{
  "totalBudget": 1200000
}
```

This updates the total budget while maintaining spent amounts.

---

### Step 17: Get Analytics

**Endpoint:** `GET /api/dashboard/analytics`
**Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

Provides:
- Overview statistics
- User contribution stats
- Monthly expense trends

---

## Testing Checklist

- [ ] Admin can register and login
- [ ] Users can register and login
- [ ] Admin can create/update budget
- [ ] Admin can create tasks
- [ ] Users can submit expenses (pending status)
- [ ] Admin can approve/reject expenses
- [ ] Admin-created expenses are auto-approved
- [ ] Budget updates automatically on approval
- [ ] Over/under budget tracking works
- [ ] Users can only see their own expenses
- [ ] Admin can see all expenses
- [ ] Dashboard data is accurate
- [ ] Cannot delete approved expenses
- [ ] Cannot update non-pending expenses
- [ ] PIN must be 4 digits
- [ ] JWT authentication works
- [ ] Role-based access control works

---

## Common Issues

### Issue: "Not authorized to access this route"
**Solution:** Make sure you're including the JWT token in the Authorization header:
```
Authorization: Bearer <your_token_here>
```

### Issue: "Task not found"
**Solution:** Use the correct task ID from the task creation response.

### Issue: "Budget not found"
**Solution:** Create a budget first using the admin account.

### Issue: "Invalid credentials"
**Solution:** Check that mobile number and PIN are correct. PIN must be exactly 4 digits.

---

## Tips

1. Save all tokens and IDs in a text file for easy reference
2. Use Postman collections to organize your tests
3. Check the console logs for detailed error messages
4. Test both success and error cases
5. Test role-based access (user trying admin endpoints)

Happy Testing! 🎉
