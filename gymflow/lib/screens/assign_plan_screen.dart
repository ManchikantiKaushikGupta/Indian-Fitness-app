import 'package:flutter/material.dart';
import '../services/membership_service.dart';

class AssignPlanScreen extends StatefulWidget {
  final int memberId;
  AssignPlanScreen({required this.memberId});

  @override
  _AssignPlanScreenState createState() => _AssignPlanScreenState();
}

class _AssignPlanScreenState extends State<AssignPlanScreen> {
  String _selectedPlan = 'Monthly';
  final _plans = ['Monthly', 'Quarterly', 'Yearly'];
  bool _isLoading = false;

  void _submit() async {
    if (!mounted) return; setState(() => _isLoading = true);
    final now = DateTime.now();
    DateTime end;
    if (_selectedPlan == 'Monthly') end = DateTime(now.year, now.month + 1, now.day);
    else if (_selectedPlan == 'Quarterly') end = DateTime(now.year, now.month + 3, now.day);
    else end = DateTime(now.year + 1, now.month, now.day);

    bool success = await MembershipService().assignMembership(
      widget.memberId,
      _selectedPlan,
      now.toIso8601String(),
      end.toIso8601String()
    );

    if (!mounted) return; setState(() => _isLoading = false);
    if (success) {
      Navigator.pop(context, true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to assign plan')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Assign Gym Plan')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            DropdownButtonFormField<String>(
              value: _selectedPlan,
              decoration: InputDecoration(labelText: 'Plan Type', border: OutlineInputBorder()),
              items: _plans.map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
              onChanged: (v) => setState(() => _selectedPlan = v!),
            ),
            SizedBox(height: 30),
            _isLoading
                ? CircularProgressIndicator()
                : ElevatedButton(
                    onPressed: _submit,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text('Confirm Assignment'),
                    ),
                  )
          ],
        ),
      ),
    );
  }
}
