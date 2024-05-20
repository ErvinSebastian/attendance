import apiClient from './api-client';

export interface Entity {
  id: number;
}
class HttpService {
  endpoint: string;
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }
  getAll<T>() {
    const controller = new AbortController();

    const request = apiClient.get<T[]>(this.endpoint, {
      signal: controller.signal,
    });

    return { request, cancel: () => controller.abort() };
  }

  getAllTeachers<T>() {
    const response = apiClient.get(this.endpoint);
    return response;
  }

  getAllSubjects() {
    const response = apiClient.get(this.endpoint);
    return response;
  }

  getData(id: number) {
    const session = JSON.parse(sessionStorage.getItem('user'));
    const response = apiClient.get(this.endpoint + '/' + id, {
      params: { id: id, user: session ? session : undefined },
    });
    return response;
  }

  saveData(id: number, data: object) {
    const response = apiClient.post(this.endpoint + '/' + id, data);
    return response;
  }

  delete(id: any) {
    return apiClient.delete(this.endpoint + '/' + id);
  }

  login(data: object) {
    const response = apiClient.post('/login', data);
    return response;
  }

  register(data: object) {
    const response = apiClient.post('/register', data);
    return response;
  }

  changePassword(id: number, data: object) {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const response = apiClient.post('/change_password', {
      user: user,
      password_data: data ? data : undefined,
    });
    return response;
  }

  getStudentSubjectList(student_id: number) {
    const controller = new AbortController();
    const request = apiClient.post('/student_subjects', {
      student_id: student_id,
    });
    return { request, cancel: () => controller.abort() };
  }

  getTeacherSubjectList(teacher_id: number) {
    const controller = new AbortController();
    const request = apiClient.post('/teacher_subjects', {
      teacher_id: teacher_id,
    });
    return { request, cancel: () => controller.abort() };
  }

  time_in(
    class_data: object,
    schedule: object,
    user: object,
    currentDate: string,
  ) {
    const requestData = {
      class_data: class_data,
      schedule: schedule,
      user: user,
      currentDate,
    };
    const response = apiClient.post('/time_in', requestData);
    return response;
  }
  getAllStudents<T>() {
    const response = apiClient.get(this.endpoint);
    return response;
  }
  getStudentsByQuery(params: object) {
    const queryParams = params;

    const response = apiClient.post('/get_students_by_query', queryParams);
    return response;
  }

  getUserSummary(user: object) {
    const requestData = {
      user: user,
    };
    const response = apiClient.post('/user_summary', requestData);
    return response;
  }

  getTeachersOfStudent(id: object) {
    const requestData = {
      userId: id,
    };
    const response = apiClient.post(
      '/teachers_of_student_by_query',
      requestData,
    );
    return response;
  }

  getStudentsOfTeacher(id: object) {
    const requestData = {
      userId: id,
    };
    const response = apiClient.post(
      '/students_of_teacher_by_query',
      requestData,
    );
    return response;
  }

  getSubjectsOfStudent(id: object, userTypeName: string) {
    const requestData = {
      userId: id,
      user_type_name: userTypeName,
    };
    const response = apiClient.post(
      '/subjects_of_student_by_query',
      requestData,
    );
    return response;
  }

  getAttendanceReport(params: object) {
    const requestData = params;
    const response = apiClient.post('/attendance_report', requestData);
    return response;
  }

  getSchedules(user: object) {
    const requestData = {
      user: user,
    };
    const response = apiClient.post('/schedules', requestData);
    return response;
  }
}

const create = (endpoint: string) => new HttpService(endpoint);
export default create;
