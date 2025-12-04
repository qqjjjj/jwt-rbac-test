const BASE_URL = "http://localhost:3000";

// Helper function to make requests
async function request(method, path, token = null, body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();

  return {
    status: response.status,
    data,
  };
}

// Test runner
async function runTests() {
  console.log("==========================================");
  console.log("JWT RBAC API Test Suite");
  console.log("==========================================\n");

  let adminToken, userToken;
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Login as ADMIN
  try {
    console.log("✓ Test 1: Login as ADMIN");
    const result = await request("POST", "/api/auth/login", null, {
      email: "admin@test.com",
      password: "password123",
    });

    if (result.status === 200 && result.data.token) {
      adminToken = result.data.token;
      console.log("  ✓ Status: 200");
      console.log("  ✓ Token received");
      console.log("  ✓ Role:", result.data.user.role);
      testsPassed++;
    } else {
      throw new Error("Login failed");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Test 2: Login as USER
  try {
    console.log("✓ Test 2: Login as USER");
    const result = await request("POST", "/api/auth/login", null, {
      email: "user@test.com",
      password: "password123",
    });

    if (result.status === 200 && result.data.token) {
      userToken = result.data.token;
      console.log("  ✓ Status: 200");
      console.log("  ✓ Token received");
      console.log("  ✓ Role:", result.data.user.role);
      testsPassed++;
    } else {
      throw new Error("Login failed");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Test 3: Create campaign as ADMIN
  try {
    console.log("✓ Test 3: Create campaign as ADMIN");
    const result = await request("POST", "/api/campaigns", adminToken, {
      name: "Summer Sale 2024",
      budget: 50000,
      start_date: "2024-06-01",
      end_date: "2024-08-31",
    });

    if (result.status === 201 && result.data.id) {
      console.log("  ✓ Status: 201");
      console.log("  ✓ Campaign created with ID:", result.data.id);
      console.log("  ✓ Budget visible:", result.data.budget !== undefined);
      testsPassed++;
    } else {
      throw new Error("Campaign creation failed");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Test 4: Create campaign as USER
  try {
    console.log("✓ Test 4: Create campaign as USER");
    const result = await request("POST", "/api/campaigns", userToken, {
      name: "Winter Campaign 2024",
      budget: 30000,
      start_date: "2024-12-01",
      end_date: "2024-12-31",
    });

    if (result.status === 201 && result.data.id) {
      console.log("  ✓ Status: 201");
      console.log("  ✓ Campaign created with ID:", result.data.id);
      console.log("  ✓ Budget hidden:", result.data.budget === undefined);
      testsPassed++;
    } else {
      throw new Error("Campaign creation failed");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Test 5: Get all campaigns as ADMIN (should see budget)
  try {
    console.log("✓ Test 5: Get all campaigns as ADMIN (should see budget)");
    const result = await request("GET", "/api/campaigns", adminToken);

    if (result.status === 200 && Array.isArray(result.data)) {
      const hasBudget =
        result.data.length > 0 && result.data[0].budget !== undefined;
      console.log("  ✓ Status: 200");
      console.log("  ✓ Campaigns count:", result.data.length);
      console.log("  ✓ Budget field visible:", hasBudget);
      if (hasBudget) {
        testsPassed++;
      } else {
        throw new Error("Budget field should be visible for ADMIN");
      }
    } else {
      throw new Error("Failed to fetch campaigns");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Test 6: Get all campaigns as USER (should NOT see budget)
  try {
    console.log("✓ Test 6: Get all campaigns as USER (should NOT see budget)");
    const result = await request("GET", "/api/campaigns", userToken);

    if (result.status === 200 && Array.isArray(result.data)) {
      const hasBudget =
        result.data.length > 0 && result.data[0].budget !== undefined;
      console.log("  ✓ Status: 200");
      console.log("  ✓ Campaigns count:", result.data.length);
      console.log("  ✓ Budget field hidden:", !hasBudget);
      if (!hasBudget) {
        testsPassed++;
      } else {
        throw new Error("Budget field should be hidden for USER");
      }
    } else {
      throw new Error("Failed to fetch campaigns");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Test 7: Update own campaign as USER (should succeed)
  try {
    console.log("✓ Test 7: Update own campaign as USER (should succeed)");

    // First create a campaign as USER
    const createResult = await request("POST", "/api/campaigns", userToken, {
      name: "User Campaign to Update",
      budget: 20000,
      start_date: "2024-03-01",
      end_date: "2024-03-31",
    });

    if (createResult.status !== 201) {
      throw new Error("Failed to create campaign for update test");
    }

    const campaignId = createResult.data.id;
    console.log("  ✓ Created campaign with ID:", campaignId);

    // Now update it
    const updateResult = await request(
      "PUT",
      `/api/campaigns/${campaignId}`,
      userToken,
      {
        name: "Updated User Campaign",
      }
    );

    if (updateResult.status === 200) {
      console.log("  ✓ Status: 200");
      console.log("  ✓ Campaign updated successfully");
      testsPassed++;
    } else {
      throw new Error("Update failed");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Test 8: Update other's campaign as USER (should fail with 403)
  try {
    console.log("✓ Test 8: Update other's campaign as USER (should fail 403)");
    const result = await request("PUT", "/api/campaigns/1", userToken, {
      name: "Trying to update admin campaign",
    });

    if (result.status === 403) {
      console.log("  ✓ Status: 403 (Forbidden)");
      console.log("  ✓ Correctly blocked");
      testsPassed++;
    } else {
      throw new Error("Should have returned 403");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Test 9: Delete campaign as USER (should fail with 403)
  try {
    console.log("✓ Test 9: Delete campaign as USER (should fail 403)");
    const result = await request("DELETE", "/api/campaigns/1", userToken);

    if (result.status === 403) {
      console.log("  ✓ Status: 403 (Forbidden)");
      console.log("  ✓ Correctly blocked");
      testsPassed++;
    } else {
      throw new Error("Should have returned 403");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Test 10: Delete campaign as ADMIN (should succeed)
  try {
    console.log("✓ Test 10: Delete campaign as ADMIN (should succeed)");

    // First create a campaign to delete
    const createResult = await request("POST", "/api/campaigns", adminToken, {
      name: "Campaign to Delete",
      budget: 10000,
      start_date: "2024-01-01",
      end_date: "2024-01-31",
    });

    if (createResult.status !== 201) {
      throw new Error("Failed to create campaign for deletion test");
    }

    const campaignId = createResult.data.id;
    console.log("  ✓ Created campaign with ID:", campaignId);

    // Now delete it
    const deleteResult = await request(
      "DELETE",
      `/api/campaigns/${campaignId}`,
      adminToken
    );

    if (deleteResult.status === 200) {
      console.log("  ✓ Status: 200");
      console.log("  ✓ Campaign deleted successfully");
      testsPassed++;
    } else {
      throw new Error("Delete failed");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Test 11: Access without token (should fail with 401)
  try {
    console.log("✓ Test 11: Access without token (should fail 401)");
    const result = await request("GET", "/api/campaigns");

    if (result.status === 401) {
      console.log("  ✓ Status: 401 (Unauthorized)");
      console.log("  ✓ Correctly blocked");
      testsPassed++;
    } else {
      throw new Error("Should have returned 401");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // ============================================
  // RBAC Management API Tests
  // ============================================
  console.log("==========================================");
  console.log("RBAC Management API Tests");
  console.log("==========================================\n");

  // Test 12: Get all permissions (ADMIN)
  try {
    console.log("✓ Test 12: Get all permissions (ADMIN)");
    const result = await request("GET", "/api/permissions", adminToken);

    if (result.status === 200 && Array.isArray(result.data)) {
      console.log("  ✓ Status: 200");
      console.log("  ✓ Permissions count:", result.data.length);
      testsPassed++;
    } else {
      throw new Error("Failed to get permissions");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Test 13: Get permissions for USER role (ADMIN)
  try {
    console.log("✓ Test 13: Get permissions for USER/sales_campaign");
    const result = await request(
      "GET",
      "/api/permissions/USER/sales_campaign",
      adminToken
    );

    if (result.status === 200 && Array.isArray(result.data)) {
      console.log("  ✓ Status: 200");
      console.log("  ✓ USER permissions:", result.data.length);
      const budgetPerm = result.data.find((p) => p.column_name === "budget");
      console.log(
        "  ✓ Budget permission:",
        budgetPerm?.can_read ? "allowed" : "denied"
      );
      testsPassed++;
    } else {
      throw new Error("Failed to get permissions");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Test 14: Set permission (ADMIN) - Allow USER to see budget
  try {
    console.log("✓ Test 14: Set permission - Allow USER to see budget");
    const result = await request("PUT", "/api/permissions", adminToken, {
      role: "USER",
      table_name: "sales_campaign",
      column_name: "budget",
      can_read: true,
    });

    if (result.status === 200) {
      console.log("  ✓ Status: 200");
      console.log("  ✓ Permission updated");
      testsPassed++;
    } else {
      throw new Error("Failed to set permission");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Test 15: Verify permission change - USER should now see budget
  try {
    console.log("✓ Test 15: Verify USER can now see budget");
    const result = await request("GET", "/api/campaigns", userToken);

    if (result.status === 200 && Array.isArray(result.data)) {
      const hasBudget =
        result.data.length > 0 && result.data[0].budget !== undefined;
      console.log("  ✓ Status: 200");
      console.log("  ✓ Budget field visible:", hasBudget);
      if (hasBudget) {
        testsPassed++;
      } else {
        throw new Error("Budget should be visible after permission change");
      }
    } else {
      throw new Error("Failed to fetch campaigns");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Test 16: Bulk set permissions (ADMIN)
  try {
    console.log("✓ Test 16: Bulk set permissions");
    const result = await request("POST", "/api/permissions/bulk", adminToken, {
      role: "USER",
      table_name: "sales_campaign",
      columns: [
        { columnName: "budget", canRead: false },
        { columnName: "name", canRead: true },
        { columnName: "start_date", canRead: true },
      ],
    });

    if (result.status === 200) {
      console.log("  ✓ Status: 200");
      console.log("  ✓ Bulk permissions updated");
      testsPassed++;
    } else {
      throw new Error("Failed to bulk set permissions");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Test 17: Verify bulk permission change - USER should NOT see budget again
  try {
    console.log("✓ Test 17: Verify USER cannot see budget again");
    const result = await request("GET", "/api/campaigns", userToken);

    if (result.status === 200 && Array.isArray(result.data)) {
      const hasBudget =
        result.data.length > 0 && result.data[0].budget !== undefined;
      console.log("  ✓ Status: 200");
      console.log("  ✓ Budget field hidden:", !hasBudget);
      if (!hasBudget) {
        testsPassed++;
      } else {
        throw new Error("Budget should be hidden after permission change");
      }
    } else {
      throw new Error("Failed to fetch campaigns");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Test 18: USER tries to manage permissions (should fail 403)
  try {
    console.log(
      "✓ Test 18: USER tries to manage permissions (should fail 403)"
    );
    const result = await request("GET", "/api/permissions", userToken);

    if (result.status === 403) {
      console.log("  ✓ Status: 403 (Forbidden)");
      console.log("  ✓ Correctly blocked");
      testsPassed++;
    } else {
      throw new Error("Should have returned 403");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Test 19: Delete a specific permission (ADMIN)
  try {
    console.log("✓ Test 19: Delete a specific permission");
    const result = await request("DELETE", "/api/permissions", adminToken, {
      role: "USER",
      table_name: "sales_campaign",
      column_name: "start_date",
    });

    if (result.status === 200) {
      console.log("  ✓ Status: 200");
      console.log("  ✓ Permission deleted");
      testsPassed++;
    } else {
      throw new Error("Failed to delete permission");
    }
  } catch (error) {
    console.log("  ✗ FAILED:", error.message);
    testsFailed++;
  }
  console.log("");

  // Summary
  console.log("==========================================");
  console.log("Test Summary");
  console.log("==========================================");
  console.log(`✓ Passed: ${testsPassed}`);
  console.log(`✗ Failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}`);
  console.log("==========================================");

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error("Test suite failed:", error);
  process.exit(1);
});
