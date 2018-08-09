exports.seed = knex => (
  knex('file_types').del()
    .then(() => knex('file_types').insert([
      {
        title: 'bash_profile',
        extension: '.sh',
        categories_id: 1,
      },
      {
        title: 'zshrc',
        extension: '.sh',
        categories_id: 1,
      },
      {
        title: 'profile',
        extension: '.sh',
        categories_id: 1,
      },
      {
        title: 'bashrc',
        extension: '.sh',
        categories_id: 1,
      },
      {
        title: 'bash_completions',
        categories_id: 1,
      },
      {
        title: 'brew_list',
        categories_id: 2,
      },
      {
        title: 'brew_leaves',
        categories_id: 2,
      },
      {
        title: 'brew_cask',
        categories_id: 2,
      },
      {
        title: 'brew_services',
        categories_id: 2,
      },
      {
        title: 'gitignore_global',
        categories_id: 3,
      },
      {
        title: 'gitconfig',
        categories_id: 3,
      },
      {
        title: 'npm_global',
        categories_id: 4,
      },
      {
        title: 'nvmrc',
        categories_id: 4,
      },
      {
        title: 'apm',
        categories_id: 5,
      },
      {
        title: 'atom_config',
        extension: '.cson',
        categories_id: 5,
      },
      {
        title: 'atom_keymap',
        extension: '.cson',
        categories_id: 5,
      },
      {
        title: 'atom_snippets',
        extension: '.cson',
        categories_id: 5,
      },
      {
        title: 'atom_styles',
        extension: '.less',
        categories_id: 5,
      },
      {
        title: 'atom_init',
        extension: '.coffee',
        categories_id: 5,
      },
      {
        title: 'vs_settings',
        extension: '.json',
        categories_id: 6,
      },
      {
        title: 'vs_extensions',
        categories_id: 6,
      },
      {
        title: 'vimrc',
        categories_id: 7,
      },
      {
        title: 'nanorc',
        categories_id: 7,
      },
    ]))
);
