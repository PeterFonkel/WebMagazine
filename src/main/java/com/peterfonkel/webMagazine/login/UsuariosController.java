package com.peterfonkel.webMagazine.login;

import java.time.Instant;


import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.webmvc.PersistentEntityResource;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.hateoas.CollectionModel;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.peterfonkel.webMagazine.entities.Categoria;
import com.peterfonkel.webMagazine.entities.Publicacion;
import com.peterfonkel.webMagazine.entities.Tag;
import com.peterfonkel.webMagazine.login.dto.EmailDto;
import com.peterfonkel.webMagazine.login.jwt.JwtProvider;
import com.peterfonkel.webMagazine.login.roles.Rol;
import com.peterfonkel.webMagazine.login.roles.RolDAO;
import com.peterfonkel.webMagazine.login.roles.RolService;
import com.peterfonkel.webMagazine.login.usuarios.UsuarioDAO;
import com.peterfonkel.webMagazine.login.usuarios.UsuarioService;
import com.peterfonkel.webMagazine.login.usuarios.entidades.Usuario;



@RepositoryRestController
@RequestMapping(path = "/usuarios/search")
@CrossOrigin
public class UsuariosController {

	@Value("${secretPsw}")
	String secretPsw;

	@Autowired
	PasswordEncoder passwordEncoder;

	@Autowired
	UsuarioService usuarioService;

	@Autowired
	RolDAO rolDAO;
	
	@Autowired
	UsuarioDAO usuarioDAO;
	

	private final static Logger logger = LoggerFactory.getLogger(JwtProvider.class);

	public String getSecretPsw() {
		return secretPsw;
	}

	public PasswordEncoder getPasswordEncoder() {
		return passwordEncoder;
	}



	public UsuarioService getUsuarioService() {
		return usuarioService;
	}

	@PreAuthorize("hasRole('ROLE_ADMIN')")
	@PostMapping(path = "nuevoUsuario")
	private PersistentEntityResource saveNuevoUsuario(PersistentEntityResourceAssembler assembler, @RequestBody Usuario usuario) {
		logger.info("Salvando nuevo Usuario: " + usuario);
		Usuario usuarioNuevo = new Usuario(usuario.getEmail(), getPasswordEncoder().encode(usuario.getPassword()));
		Rol rol = rolDAO.findByRolNombre(usuario.getRol().getRolNombre()).get();
		logger.info("Asignando el rol: ", rol);
		usuarioNuevo.agregarRoles(usuarioNuevo.getRoles());
		usuarioDAO.save(usuarioNuevo);
		return assembler.toModel(usuarioNuevo);
	}
	

	@PostMapping(path = "usuarioFromEmail")
	@ResponseBody
	public PersistentEntityResource usuarioFromEmail(PersistentEntityResourceAssembler assembler,@RequestBody EmailDto emailDto) {	
		Usuario usuario = usuarioService.getByEmail(emailDto.getValue()).get();
		return assembler.toModel(usuario);
	}

	@GetMapping(path = "usuariosPremium")
	@ResponseBody
	public CollectionModel<PersistentEntityResource> getUsuariosPremium(PersistentEntityResourceAssembler assembler) {
		List<Usuario> listadoUsuarios = usuarioDAO.findAll();
		List<Usuario> listadoUsuariosPremium = new ArrayList<Usuario>();
		for (Usuario usuario : listadoUsuarios) {
			if (usuario.getSuscripcion().equals("premium")) {
				listadoUsuariosPremium.add(usuario);
			}
		}
		return assembler.toCollectionModel(listadoUsuariosPremium);
	}
	
	@GetMapping(path = "usuariosFree")
	@ResponseBody
	public CollectionModel<PersistentEntityResource> getUsuariosFree(PersistentEntityResourceAssembler assembler) {
		List<Usuario> listadoUsuarios = usuarioDAO.findAll();
		List<Usuario> listadoUsuariosFree = new ArrayList<Usuario>();
		for (Usuario usuario : listadoUsuarios) {
			if (usuario.getSuscripcion().equals("free")) {
				listadoUsuariosFree.add(usuario);
			}
		}
		return assembler.toCollectionModel(listadoUsuariosFree);
	}

	@GetMapping(path = "autores")
	@ResponseBody
	public CollectionModel<PersistentEntityResource> getAutores(PersistentEntityResourceAssembler assembler) {
		return assembler.toCollectionModel(usuarioDAO.findAll());
//		return assembler.toCollectionModel(usuarioDAO.findByRoles_RolNombre("ROLE_ADMIN"));
	}
	
	@PatchMapping(path="modificarUsuario")
	@ResponseBody
	public PersistentEntityResource modificarUsuario(PersistentEntityResourceAssembler assembler, @RequestBody Usuario usuarioModificado) {
		Usuario usuarioAntiguo = usuarioDAO.findById(usuarioModificado.getId());
		usuarioAntiguo.setNombre(usuarioModificado.getNombre());
		usuarioAntiguo.setApellido1(usuarioModificado.getApellido1());
		usuarioAntiguo.setApellido2(usuarioModificado.getApellido2());
		usuarioAntiguo.setEmail(usuarioModificado.getEmail());
		usuarioAntiguo.agregarRoles(usuarioModificado.getRoles());
		usuarioAntiguo.setPassword(passwordEncoder.encode(usuarioModificado.getPassword()));
		
		usuarioDAO.save(usuarioAntiguo);
		return assembler.toModel(usuarioAntiguo);
	}
	
	@DeleteMapping(path="eliminarUsuario/{id}")
	@ResponseBody
	public void eliminarUsuarioEntityResource (PersistentEntityResourceAssembler assembler, @PathVariable("id") Long id) {
		Usuario usuario = usuarioDAO.findById(id);
		usuarioDAO.delete(usuario);
	}

}
