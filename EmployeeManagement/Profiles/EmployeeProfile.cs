using AutoMapper;
using EmployeeManagement.DTOs;
using EmployeeManagement.Models;

namespace EmployeeManagement.Profiles;

public class EmployeeProfile : Profile
{
    public EmployeeProfile()
    {
        CreateMap<EmployeeCreateDto, Employee>();
        CreateMap<Employee, EmployeeReadDto>();
    }
}
