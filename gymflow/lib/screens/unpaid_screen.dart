import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/payment_service.dart';

class UnpaidScreen extends StatefulWidget {
  @override
  _UnpaidScreenState createState() => _UnpaidScreenState();
}

class _UnpaidScreenState extends State<UnpaidScreen> {
  final PaymentService _paymentService = PaymentService();
  List<dynamic> _unpaid = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchUnpaid();
  }

  Future<void> _fetchUnpaid() async {
    if (!mounted) return; setState(() => _isLoading = true);
    final data = await _paymentService.getUnpaid();
    if (!mounted) return; setState(() {
      _unpaid = data;
      _isLoading = false;
    });
  }

  void _sendReminder(String name, String phone, double amount) async {
    final text = Uri.encodeComponent("Hi $name, your GymFlow payment of ₹$amount is due. Kindly pay at the earliest.");
    final url = Uri.parse("https://wa.me/$phone?text=$text");
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not open WhatsApp.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Unpaid Dues')),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _unpaid.isEmpty
              ? Center(child: Text('Hooray! No pending payments.'))
              : ListView.builder(
                  itemCount: _unpaid.length,
                  itemBuilder: (context, index) {
                    final p = _unpaid[index];
                    final memberName = p['member']?['name'] ?? 'Unknown';
                    final memberPhone = p['member']?['phone'] ?? '';
                    return Card(
                      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: ListTile(
                        leading: Icon(Icons.warning, color: Colors.red),
                        title: Text(memberName, style: TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text("Due: ₹${p['amount']} | Date: ${p['due_date'].split('T')[0]}"),
                        trailing: ElevatedButton.icon(
                          icon: Icon(Icons.chat, size: 16),
                          label: Text('Remind'),
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
                          onPressed: () => _sendReminder(memberName, memberPhone, p['amount'].toDouble()),
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
