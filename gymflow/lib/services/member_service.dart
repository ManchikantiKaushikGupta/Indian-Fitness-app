import 'package:dio/dio.dart';
import 'api_service.dart';

class MemberService {
  final ApiService _api = ApiService();

  Future<List<dynamic>> getMembers() async {
    try {
      final response = await _api.client.get('/members');
      return response.data['data'] ?? [];
    } catch (e) {
      print('Failed to get members: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>?> getMemberDetails(int id) async {
    try {
      final response = await _api.client.get('/members/$id');
      return response.data;
    } catch (e) {
      print('Failed to get member: $e');
      return null;
    }
  }

  Future<bool> addMember(String name, String phone) async {
    try {
      await _api.client.post('/members', data: {'name': name, 'phone': phone});
      return true;
    } catch (e) {
      print('Failed to add member: $e');
      return false;
    }
  }

  Future<bool> updateMember(int id, String name, String phone) async {
    try {
      await _api.client.put('/members/$id', data: {'name': name, 'phone': phone});
      return true;
    } catch (e) {
      print('Failed to update member: $e');
      return false;
    }
  }

  Future<bool> deleteMember(int id) async {
    try {
      await _api.client.delete('/members/$id');
      return true;
    } catch (e) {
      return false;
    }
  }
}
