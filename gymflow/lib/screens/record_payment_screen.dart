import 'package:flutter/material.dart';
import '../services/payment_service.dart';

class RecordPaymentScreen extends StatefulWidget {
  final int memberId;
  RecordPaymentScreen({required this.memberId});

  @override
  _RecordPaymentScreenState createState() => _RecordPaymentScreenState();
}

class _RecordPaymentScreenState extends State<RecordPaymentScreen> {
  final _amountController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String _status = 'PAID';
  bool _isLoading = false;

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    bool success = await PaymentService().recordPayment(
      widget.memberId,
      double.parse(_amountController.text),
      DateTime.now().toIso8601String(),
      _status
    );

    setState(() => _isLoading = false);
    if (success) {
      Navigator.pop(context, true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to record payment')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Record Payment')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(labelText: 'Amount (₹)', border: OutlineInputBorder()),
                validator: (v) => v!.isEmpty ? 'Enter amount' : null,
              ),
              SizedBox(height: 20),
              DropdownButtonFormField<String>(
                value: _status,
                decoration: InputDecoration(labelText: 'Status', border: OutlineInputBorder()),
                items: ['PAID', 'UNPAID'].map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                onChanged: (v) => setState(() => _status = v!),
              ),
              SizedBox(height: 30),
              _isLoading
                  ? CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: _submit,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Text('Save Payment'),
                      ),
                    )
            ],
          ),
        ),
      ),
    );
  }
}
