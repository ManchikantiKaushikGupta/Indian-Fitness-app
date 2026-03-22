import 'api_service.dart';

class PaymentService {
  final ApiService _api = ApiService();

  Future<bool> recordPayment(int memberId, double amount, String dueDate, String status) async {
    try {
      await _api.client.post('/payments', data: {
        'member_id': memberId,
        'amount': amount,
        'due_date': dueDate,
        'status': status,
      });
      return true;
    } catch (e) {
      print('Failed to record payment: $e');
      return false;
    }
  }

  Future<List<dynamic>> getUnpaid() async {
    try {
      final response = await _api.client.get('/payments/unpaid');
      return response.data;
    } catch (e) {
      print('Failed to get unpaid: $e');
      return [];
    }
  }
}
