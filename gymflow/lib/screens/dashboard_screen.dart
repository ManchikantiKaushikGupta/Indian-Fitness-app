import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';
import 'members_screen.dart'; // We will create this
import 'unpaid_screen.dart'; // We will create this

class DashboardScreen extends StatefulWidget {
  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  Map<String, dynamic>? _summary;

  @override
  void initState() {
    super.initState();
    _fetchSummary();
  }

  Future<void> _fetchSummary() async {
    try {
      final response = await _apiService.client.get('/dashboard/summary');
      if (!mounted) return; setState(() {
        _summary = response.data;
        _isLoading = false;
      });
    } catch (e) {
      print('Failed to load summary: $e');
      if (!mounted) return; setState(() => _isLoading = false);
    }
  }

  void _logout() async {
    await AuthService().logout();
    if (!mounted) return;
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (c) => LoginScreen()));
  }

  Widget _buildStatCard(String title, dynamic value, IconData icon, Color color) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: color),
            SizedBox(height: 10),
            Text(title, style: TextStyle(fontSize: 16, color: Colors.grey[700])),
            SizedBox(height: 5),
            Text(
              '$value',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87),
            )
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('GymFlow Dashboard'),
        actions: [
          IconButton(icon: Icon(Icons.logout), onPressed: _logout),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchSummary,
              child: ListView(
                padding: EdgeInsets.all(16),
                children: [
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    children: [
                      _buildStatCard('Total Members', _summary?['total_members'] ?? 0, Icons.people, Colors.blue),
                      _buildStatCard('Active Plans', _summary?['active_members'] ?? 0, Icons.check_circle, Colors.green),
                      _buildStatCard('Expiring Soon', _summary?['expiring_soon'] ?? 0, Icons.warning_amber_rounded, Colors.orange),
                      _buildStatCard('Pending Dues', _summary?['pending_payments'] ?? 0, Icons.money_off, Colors.red),
                    ],
                  ),
                  SizedBox(height: 30),
                  ElevatedButton.icon(
                    icon: Icon(Icons.people_alt),
                    label: Text('Manage Members'),
                    style: ElevatedButton.styleFrom(padding: EdgeInsets.symmetric(vertical: 16)),
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (c) => MembersScreen()));
                    },
                  ),
                  SizedBox(height: 15),
                  ElevatedButton.icon(
                    icon: Icon(Icons.receipt_long),
                    label: Text('View Unpaid Payments'),
                    style: ElevatedButton.styleFrom(padding: EdgeInsets.symmetric(vertical: 16), backgroundColor: Colors.red[50]),
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (c) => UnpaidScreen()));
                    },
                  ),
                ],
              ),
            ),
    );
  }
}
