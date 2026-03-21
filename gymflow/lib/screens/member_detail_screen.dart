import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/member_service.dart';
import 'assign_plan_screen.dart'; // We will create this
import 'record_payment_screen.dart'; // We will create this

class MemberDetailScreen extends StatefulWidget {
  final int memberId;
  MemberDetailScreen({required this.memberId});

  @override
  _MemberDetailScreenState createState() => _MemberDetailScreenState();
}

class _MemberDetailScreenState extends State<MemberDetailScreen> {
  final MemberService _memberService = MemberService();
  Map<String, dynamic>? _member;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  void _fetchData() async {
    setState(() => _isLoading = true);
    final data = await _memberService.getMemberDetails(widget.memberId);
    setState(() {
      _member = data;
      _isLoading = false;
    });
  }

  void _sendWhatsAppReminder(double amount) async {
    if (_member == null) return;
    final phone = _member!['phone'];
    final name = _member!['name'];
    final text = Uri.encodeComponent("Hi \$name, your payment of ₹\$amount is due. Please settle it soon. Thank you!");
    final url = Uri.parse("https://wa.me/\$phone?text=\$text");

    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not open WhatsApp.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return Scaffold(appBar: AppBar(title: Text('Loading...')), body: Center(child: CircularProgressIndicator()));
    if (_member == null) return Scaffold(appBar: AppBar(title: Text('Error')), body: Center(child: Text('Member not found')));

    final memberships = _member!['memberships'] as List;
    final payments = _member!['payments'] as List;

    // MVP simplification: get latest plan
    final currentPlan = memberships.isNotEmpty ? memberships.last : null;

    return Scaffold(
      appBar: AppBar(
        title: Text(_member!['name']),
        actions: [
          IconButton(
            icon: Icon(Icons.delete),
            onPressed: () async {
              // MVP Delete confirm
              await _memberService.deleteMember(widget.memberId);
              Navigator.pop(context);
            },
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Phone: \${_member!['phone']}", style: TextStyle(fontSize: 18)),
            SizedBox(height: 20),
            Divider(),
            Text('Current Plan', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            if (currentPlan == null) 
              Text('No active plan.')
            else
              ListTile(
                title: Text(currentPlan['plan_type']),
                subtitle: Text("Status: \${currentPlan['status']} | Ends: \${currentPlan['end_date'].toString().split('T')[0]}"),
                trailing: currentPlan['status'] == 'Active' ? Icon(Icons.check_circle, color: Colors.green) : Icon(Icons.cancel, color: Colors.red),
              ),
            ElevatedButton(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (c) => AssignPlanScreen(memberId: widget.memberId))).then((_) => _fetchData()),
              child: Text(currentPlan == null ? 'Assign Plan' : 'Renew Plan'),
            ),
            SizedBox(height: 20),
            Divider(),
            Text('Payment History', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ...payments.map((p) {
              bool isUnpaid = p['status'] == 'UNPAID';
              return ListTile(
                title: Text("₹\${p['amount']}"),
                subtitle: Text("Due: \${p['due_date'].toString().split('T')[0]}"),
                trailing: isUnpaid
                    ? Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(icon: Icon(Icons.message, color: Colors.green), onPressed: () => _sendWhatsAppReminder(p['amount'].toDouble())),
                          Text('UNPAID', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold))
                        ],
                      )
                    : Text('PAID', style: TextStyle(color: Colors.green)),
              );
            }).toList(),
            SizedBox(height: 10),
            ElevatedButton(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (c) => RecordPaymentScreen(memberId: widget.memberId))).then((_) => _fetchData()),
              child: Text('Record Payment'),
            )
          ],
        ),
      ),
    );
  }
}
